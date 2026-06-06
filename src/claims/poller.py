"""Poll Strapi /claims and post Cobros to Please.market X timeline."""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone

from src.config import settings
from src.db.pool import db_conn
from src.markets.backend import BackendClient
from src.x.client import XClient
from src.x.reply import compose_claim_post

logger = logging.getLogger(__name__)

_cursor: str | None = None
_hour_posts = 0
_hour_start: datetime | None = None


async def run_claims_loop(backend: BackendClient, x: XClient) -> None:
    global _cursor
    while True:
        try:
            if settings.please_claim_post_enabled:
                await _poll_claims(backend, x)
        except Exception as exc:
            logger.exception("claims loop error: %s", exc)
        await asyncio.sleep(settings.claims_poll_interval_seconds)


async def _poll_claims(backend: BackendClient, x: XClient) -> None:
    global _cursor, _hour_posts, _hour_start

    if not settings.api_token:
        return

    now = datetime.now(timezone.utc)
    if _hour_start is None or (now - _hour_start).total_seconds() > 3600:
        _hour_start = now
        _hour_posts = 0

    if _hour_posts >= settings.please_claim_post_max_per_hour:
        return

    rows = await backend.fetch_claims_since(_cursor)
    for row in rows:
        claim_id = str(row.get("id") or row.get("documentId") or "")
        redeemed_at = row.get("redeemed_at")
        if not claim_id or not redeemed_at:
            continue

        if _already_posted(claim_id):
            _cursor = str(redeemed_at)
            continue

        reward = float(row.get("reward_usdc") or row.get("amount") or 0)
        if reward < settings.please_claim_post_min_usdc:
            _cursor = str(redeemed_at)
            continue

        market = row.get("market") or {}
        if settings.please_claim_post_only_agent_markets:
            if market.get("created_via") != "PLEASE_MARKET_X":
                _cursor = str(redeemed_at)
                continue

        trader = (row.get("trader_wallet") or row.get("wallet") or "Trader")[:12]
        title = market.get("title") or market.get("question") or "Market"
        doc = market.get("documentId") or market.get("id") or ""
        url = f"{settings.anyone_web_base}/en/market/{doc}"
        text = compose_claim_post(trader, reward, title, url)

        quote_id = market.get("source_tweet_url")  # optional — store deploy tweet id in Strapi later
        tweet_id = await x.post_timeline(text, quote_tweet_id=None)
        if tweet_id:
            _mark_posted(claim_id, tweet_id)
            _hour_posts += 1

        _cursor = str(redeemed_at)


def _already_posted(claim_id: str) -> bool:
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM claims_posted WHERE claim_id = %s", (claim_id,))
            return cur.fetchone() is not None


def _mark_posted(claim_id: str, tweet_id: str) -> None:
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO claims_posted (claim_id, tweet_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                (claim_id, tweet_id),
            )
        conn.commit()
