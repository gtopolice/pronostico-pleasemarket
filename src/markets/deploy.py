"""Deploy market via org API with hackathon fallback to agent store."""

from __future__ import annotations

import logging
import uuid
from typing import Any

import httpx

from src.config import settings
from src.db.wallet_link import save_demo_market
from src.intent.models import MarketIntent, TweetContext
from src.markets.backend import BackendClient

logger = logging.getLogger(__name__)


async def deploy_market_with_fallback(
    backend: BackendClient,
    intent: MarketIntent,
    ctx: TweetContext,
    wallet_address: str,
    smart_wallet_address: str | None = None,
) -> dict[str, Any]:
    try:
        return await backend.deploy_market(intent, ctx, wallet_address, smart_wallet_address)
    except httpx.HTTPError as exc:
        logger.warning("Backend deploy failed (%s) — using hackathon fallback store", exc)

    doc_id = str(uuid.uuid4())
    locale = intent.locale
    payload = {
        "documentId": doc_id,
        "question": intent.question,
        "title": intent.title,
        "description": intent.resolution_rules,
        "resolution_rules": intent.resolution_rules,
        "close_time_utc": intent.close_time.isoformat(),
        "state": "REVIEWED",
        "created_via": "CHIWIWIS_X",
        "source_twitter_id": ctx.author_id,
        "source_tweet_url": ctx.tweet_url,
        "creator_wallet": smart_wallet_address or wallet_address,
        "locale": locale,
        "hackathon_fallback": True,
    }
    save_demo_market(doc_id, payload)
    base = settings.chiwiwis_web_url.rstrip("/")
    return {
        "documentId": doc_id,
        "market_id": f"demo-{doc_id[:8]}",
        "market_url": f"{base}/{locale}/market/{doc_id}",
        "hackathon_fallback": True,
    }
