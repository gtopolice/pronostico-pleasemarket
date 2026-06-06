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
    get_mention_action,
    is_allowlisted,
    is_kill_switch_active,
    mention_already_processed,
    moderate_intent,
    record_mention,
    update_mention_record,
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
        author_profile_image_url=tweet.get("author_profile_image_url"),
        text=tweet.get("text", ""),
        parent_text=tweet.get("parent_text"),
        quoted_text=tweet.get("quoted_text"),
        tweet_url=f"https://x.com/i/status/{tweet_id}",
    )

    text_lower = ctx.text.lower()
    handles = {
        settings.please_x_handle.lower(),
        "chiwiwis",
        "pleasemarket",
        "pleasemarketbot",
        "please.market",
    }

    if _SHARE_RE.search(ctx.text) or _AMP_RE.search(ctx.text):
        await _handle_share_command(ctx, backend, x)
        return

    if not any(h in text_lower or f"@{h}" in text_lower for h in handles):
        return

    if is_kill_switch_active() and not settings.please_dry_run:
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

    if not is_allowlisted(author_id) and not settings.please_dry_run:
        reply_id = await x.reply(tweet_id, compose_reject_reply("Testnet allowlist only for now."))
        record_mention(tweet_id, author_id, "not_allowlisted", reply_tweet_id=reply_id)
        return

    wallet = await _resolve_wallet_async(author_id, backend)
    if not wallet:
        token = create_link_token(author_id, ctx.author_handle, tweet_id)
        link_url = f"{settings.please_web_url.rstrip('/')}/link-x?token={token}"
        reply_id = await x.reply(tweet_id, compose_link_wallet_reply(link_url))
        record_mention(tweet_id, author_id, "link_required", reply_tweet_id=reply_id)
        return

    result = await _create_market_for_mention(ctx, wallet, backend, x)
    if not result:
        return

    record_mention(tweet_id, author_id, result["action"], result["document_id"], result["reply_tweet_id"])


async def resume_pending_market_after_link(
    tweet_id: str,
    author_id: str,
    author_handle: str | None,
    wallet: dict,
    backend: BackendClient,
    x: XClient,
) -> dict | None:
    """Create the market from a tweet that previously stopped at link_required."""

    if get_mention_action(tweet_id) != "link_required":
        logger.info("skip resume tweet=%s: not link_required", tweet_id)
        return None

    tweet = await x.fetch_tweet(tweet_id)
    if not tweet:
        logger.warning("resume failed: could not fetch tweet %s", tweet_id)
        return None

    if str(tweet.get("author_id")) != str(author_id):
        logger.warning("resume failed: tweet author mismatch for %s", tweet_id)
        return None

    ctx = TweetContext(
        tweet_id=tweet_id,
        author_id=author_id,
        author_handle=tweet.get("author_handle") or author_handle,
        author_profile_image_url=tweet.get("author_profile_image_url"),
        text=tweet.get("text", ""),
        parent_text=None,
        quoted_text=None,
        tweet_url=f"https://x.com/i/status/{tweet_id}",
    )

    if is_kill_switch_active() and not settings.please_dry_run:
        reply_id = await x.reply(tweet_id, compose_reject_reply("Agent paused for maintenance."))
        update_mention_record(tweet_id, "rejected", reply_tweet_id=reply_id)
        return None

    ok_rate, rate_msg = check_user_rate_limit(author_id)
    if not ok_rate:
        reply_id = await x.reply(tweet_id, compose_reject_reply(rate_msg or "Rate limited"))
        update_mention_record(tweet_id, "rate_limited", reply_tweet_id=reply_id)
        return None

    ok_rep, rep_msg = can_create(author_id)
    if not ok_rep:
        reply_id = await x.reply(tweet_id, compose_reject_reply(rep_msg or "Restricted"))
        update_mention_record(tweet_id, "restricted", reply_tweet_id=reply_id)
        return None

    if not is_allowlisted(author_id) and not settings.please_dry_run:
        reply_id = await x.reply(tweet_id, compose_reject_reply("Testnet allowlist only for now."))
        update_mention_record(tweet_id, "not_allowlisted", reply_tweet_id=reply_id)
        return None

    result = await _create_market_for_mention(ctx, wallet, backend, x, is_resume=True)
    if not result:
        return None

    update_mention_record(tweet_id, result["action"], result["document_id"], result["reply_tweet_id"])
    return {
        "document_id": result["document_id"],
        "market_url": result["market_url"],
        "question": result["question"],
        "action": result["action"],
    }


async def _create_market_for_mention(
    ctx: TweetContext,
    wallet: dict,
    backend: BackendClient,
    x: XClient,
    *,
    is_resume: bool = False,
) -> dict | None:
    """Parse, moderate, deploy, and reply. Returns market result dict or None."""

    intent = await parse_market_intent(ctx)
    ok_mod, mod_msg = moderate_intent(ctx, intent)
    if not ok_mod:
        reply_id = await x.reply(ctx.tweet_id, compose_reject_reply(mod_msg or "Rejected"))
        if is_resume:
            update_mention_record(ctx.tweet_id, "moderation_reject", reply_tweet_id=reply_id)
        else:
            record_mention(ctx.tweet_id, ctx.author_id, "moderation_reject", reply_tweet_id=reply_id)
        audit("moderation_reject", ctx.author_id, ctx.tweet_id, {"reason": mod_msg})
        return None

    dry = settings.please_dry_run or not settings.agent_deploy_enabled
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
                "creator_twitter_id": ctx.author_id,
                "creator_twitter_handle": ctx.author_handle,
                "creator_profile_image_url": ctx.author_profile_image_url,
            },
        )
        market_url = f"{settings.please_web_url.rstrip('/')}/{intent.locale}/market/{doc_id}"
        reply = compose_deploy_reply(intent, market_url, doc_id, get_score(ctx.author_id), dry_run=True)
        reply_id = await x.reply(ctx.tweet_id, reply)
        audit("dry_run", ctx.author_id, ctx.tweet_id, {"question": intent.question, "documentId": doc_id})
        return {
            "action": "dry_run",
            "document_id": doc_id,
            "reply_tweet_id": reply_id,
            "question": intent.question,
            "market_url": market_url,
        }

    result = await deploy_market_with_fallback(
        backend,
        intent,
        ctx,
        wallet["wallet_address"],
        wallet.get("smart_wallet_address"),
    )
    doc_id = result.get("documentId", "")
    market_url = result.get("market_url") or f"{settings.please_web_url.rstrip('/')}/{intent.locale}/market/{doc_id}"
    reply = compose_deploy_reply(intent, market_url, doc_id, get_score(ctx.author_id))
    reply_id = await x.reply(ctx.tweet_id, reply)

    record_market_created(ctx.author_id, ctx.author_handle)
    if doc_id:
        register_obligation(doc_id, ctx.author_id, intent.close_time, reply_id)
    audit("deploy", ctx.author_id, ctx.tweet_id, result)
    return {
        "action": "deploy",
        "document_id": doc_id,
        "reply_tweet_id": reply_id,
        "question": intent.question,
        "market_url": market_url,
    }


async def _handle_share_command(ctx: TweetContext, backend: BackendClient, x: XClient) -> None:
    wallet = await _resolve_wallet_async(ctx.author_id, backend)
    ref = (wallet or {}).get("old_referral_code")
    if not ref:
        await x.reply(ctx.tweet_id, compose_reject_reply("Link wallet first to get your ref link."))
        return

    m = _SHARE_RE.search(ctx.text)
    doc_id = m.group(1) if m else "market"
    url = f"{settings.please_web_url.rstrip('/')}/en/market/{doc_id}?ref={ref}&src=please_market_x"
    await x.reply(ctx.tweet_id, compose_share_reply("Trade this market ▲", url))


def _extract_tweet(payload: dict) -> dict | None:
    if "tweet_id" in payload and "text" in payload:
        return {
            "id": str(payload["tweet_id"]),
            "author_id": str(payload.get("author_id", "")),
            "author_handle": payload.get("author_handle"),
            "author_profile_image_url": payload.get("author_profile_image_url"),
            "text": payload.get("text") or "",
            "parent_text": payload.get("parent_text"),
        }

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
