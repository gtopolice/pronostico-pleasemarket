"""Mention webhook ingest and deploy orchestration."""

from __future__ import annotations

import logging
import re
import uuid

from src.config import settings
from src.db.wallet_link import create_link_token, get_wallet_by_twitter, save_demo_market
from src.intent.models import TweetContext
from src.intent.parser import parse_market_intent
from src.markets.backend import BackendClient
from src.markets.deploy import deploy_market_with_fallback
from src.moderation.rules import (
    audit,
    check_user_rate_limit,
    is_allowlisted,
    is_kill_switch_active,
    mention_already_processed,
    moderate_intent,
    record_mention,
)
from src.reputation.service import can_create, get_score, record_market_created
from src.resolution.reminders import register_obligation
from src.x.client import XClient
from src.x.reply import compose_deploy_reply, compose_link_wallet_reply, compose_reject_reply, compose_share_reply

logger = logging.getLogger(__name__)

_SHARE_RE = re.compile(r"(?i)@?\w+\s+share\s+(\w+)", re.I)
_AMP_RE = re.compile(r"(?i)amp\s+this", re.I)


def _resolve_wallet(author_id: str, backend: BackendClient) -> dict | None:
    link = get_wallet_by_twitter(author_id)
    if link:
        return {
            "wallet_address": link.wallet_address,
            "smart_wallet_address": link.smart_wallet_address,
            "old_referral_code": link.referral_code,
        }
    return None


async def _resolve_wallet_async(author_id: str, backend: BackendClient) -> dict | None:
    local = _resolve_wallet(author_id, backend)
    if local:
        return local
    try:
        remote = await backend.wallet_by_twitter(author_id)
        if remote:
            return remote
    except Exception as exc:
        logger.info("backend wallet lookup skipped: %s", exc)
    return None


async def handle_mention_payload(payload: dict, backend: BackendClient, x: XClient) -> None:
    tweet = _extract_tweet(payload)
    if not tweet:
        return

    tweet_id = tweet["id"]
    author_id = tweet.get("author_id", "")
    if mention_already_processed(tweet_id):
        return

    ctx = TweetContext(
        tweet_id=tweet_id,
        author_id=author_id,
        author_handle=tweet.get("author_handle"),
        text=tweet.get("text", ""),
        parent_text=tweet.get("parent_text"),
        quoted_text=tweet.get("quoted_text"),
        tweet_url=f"https://x.com/i/status/{tweet_id}",
    )

    text_lower = ctx.text.lower()
    handle = settings.chiwiwis_x_handle.lower()

    if _SHARE_RE.search(ctx.text) or _AMP_RE.search(ctx.text):
        await _handle_share_command(ctx, backend, x)
        return

    if handle not in text_lower and f"@{handle}" not in text_lower:
        return

    if is_kill_switch_active() and not settings.chiwiwis_dry_run:
        reply_id = await x.reply(tweet_id, compose_reject_reply("Agent paused for maintenance."))
        record_mention(tweet_id, author_id, "rejected", reply_tweet_id=reply_id)
        return

    ok_rate, rate_msg = check_user_rate_limit(author_id)
    if not ok_rate:
        reply_id = await x.reply(tweet_id, compose_reject_reply(rate_msg or "Rate limited"))
        record_mention(tweet_id, author_id, "rate_limited", reply_tweet_id=reply_id)
        return

    ok_rep, rep_msg = can_create(author_id)
    if not ok_rep:
        reply_id = await x.reply(tweet_id, compose_reject_reply(rep_msg or "Restricted"))
        record_mention(tweet_id, author_id, "restricted", reply_tweet_id=reply_id)
        return

    if not is_allowlisted(author_id) and not settings.chiwiwis_dry_run:
        reply_id = await x.reply(tweet_id, compose_reject_reply("Testnet allowlist only for now."))
        record_mention(tweet_id, author_id, "not_allowlisted", reply_tweet_id=reply_id)
        return

    wallet = await _resolve_wallet_async(author_id, backend)
    if not wallet:
        token = create_link_token(author_id, ctx.author_handle, tweet_id)
        link_url = f"{settings.chiwiwis_web_url.rstrip('/')}/link-x?token={token}"
        reply_id = await x.reply(tweet_id, compose_link_wallet_reply(link_url))
        record_mention(tweet_id, author_id, "link_required", reply_tweet_id=reply_id)
        return

    intent = await parse_market_intent(ctx)
    ok_mod, mod_msg = moderate_intent(ctx, intent)
    if not ok_mod:
        reply_id = await x.reply(tweet_id, compose_reject_reply(mod_msg or "Rejected"))
        record_mention(tweet_id, author_id, "moderation_reject", reply_tweet_id=reply_id)
        audit("moderation_reject", author_id, tweet_id, {"reason": mod_msg})
        return

    dry = settings.chiwiwis_dry_run or not settings.agent_deploy_enabled
    if dry:
        doc_id = str(uuid.uuid4())
        creator = wallet.get("smart_wallet_address") or wallet["wallet_address"]
        save_demo_market(
            doc_id,
            {
                "documentId": doc_id,
                "question": intent.question,
                "title": intent.title,
                "resolution_rules": intent.resolution_rules,
                "close_time_utc": intent.close_time.isoformat(),
                "state": "PREVIEW",
                "dry_run": True,
                "creator_wallet": creator,
            },
        )
        preview_url = f"{settings.chiwiwis_web_url.rstrip('/')}/{intent.locale}/market/{doc_id}"
        reply = compose_deploy_reply(intent, preview_url, doc_id, get_score(author_id), dry_run=True)
        reply_id = await x.reply(tweet_id, reply)
        record_mention(tweet_id, author_id, "dry_run", doc_id, reply_id)
        audit("dry_run", author_id, tweet_id, {"question": intent.question, "documentId": doc_id})
        return

    result = await deploy_market_with_fallback(
        backend,
        intent,
        ctx,
        wallet["wallet_address"],
        wallet.get("smart_wallet_address"),
    )
    doc_id = result.get("documentId", "")
    market_url = result.get("market_url") or f"{settings.chiwiwis_web_url.rstrip('/')}/{intent.locale}/market/{doc_id}"
    reply = compose_deploy_reply(intent, market_url, doc_id, get_score(author_id))
    reply_id = await x.reply(tweet_id, reply)

    record_market_created(author_id, ctx.author_handle)
    if doc_id:
        register_obligation(doc_id, author_id, intent.close_time, reply_id)
    record_mention(tweet_id, author_id, "deploy", doc_id, reply_id)
    audit("deploy", author_id, tweet_id, result)


async def _handle_share_command(ctx: TweetContext, backend: BackendClient, x: XClient) -> None:
    wallet = await _resolve_wallet_async(ctx.author_id, backend)
    ref = (wallet or {}).get("old_referral_code")
    if not ref:
        await x.reply(ctx.tweet_id, compose_reject_reply("Link wallet first to get your ref link."))
        return

    m = _SHARE_RE.search(ctx.text)
    doc_id = m.group(1) if m else "market"
    url = f"{settings.chiwiwis_web_url.rstrip('/')}/en/market/{doc_id}?ref={ref}&src=chiwiwis_x"
    await x.reply(ctx.tweet_id, compose_share_reply("Trade this market ▲", url))


def _extract_tweet(payload: dict) -> dict | None:
    if "tweet_id" in payload and "text" in payload:
        return payload

    for event in payload.get("tweet_create_events") or []:
        return {
            "id": str(event.get("id_str") or event.get("id")),
            "author_id": str(event.get("user", {}).get("id_str") or ""),
            "author_handle": event.get("user", {}).get("screen_name"),
            "text": event.get("text") or "",
            "parent_text": None,
        }

    data = payload.get("data") or payload
    if isinstance(data, dict) and data.get("id"):
        return {
            "id": str(data["id"]),
            "author_id": str(data.get("author_id", "")),
            "text": data.get("text", ""),
        }
    return None
