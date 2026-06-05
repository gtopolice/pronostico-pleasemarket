"""Org backend client for Chiwiwis deploy + wallet link."""

from __future__ import annotations

import logging
from typing import Any

import httpx

from src.config import settings
from src.intent.models import MarketIntent, TweetContext

logger = logging.getLogger(__name__)


class BackendClient:
    def __init__(self) -> None:
        self.base = settings.api_url.rstrip("/")
        self.agent_secret = settings.agent_service_secret
        self.api_token = settings.api_token

    def _agent_headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.agent_secret}",
            "Content-Type": "application/json",
        }

    def _strapi_headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_token:
            headers["Authorization"] = f"Bearer {self.api_token}"
        return headers

    async def wallet_by_twitter(self, twitter_id: str) -> dict[str, Any] | None:
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.get(
                f"{self.base}/agent/chiwiwis/wallet/{twitter_id}",
                headers=self._agent_headers(),
            )
            if r.status_code == 404:
                return None
            r.raise_for_status()
            return r.json()

    async def init_link_x(self, twitter_id: str, twitter_handle: str | None, tweet_id: str) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(
                f"{self.base}/agent/chiwiwis/link-x/init",
                headers=self._agent_headers(),
                json={"twitter_id": twitter_id, "twitter_handle": twitter_handle, "tweet_id": tweet_id},
            )
            r.raise_for_status()
            return r.json()

    async def deploy_market(
        self,
        intent: MarketIntent,
        ctx: TweetContext,
        creator_wallet: str,
        creator_smart_wallet: str | None = None,
    ) -> dict[str, Any]:
        payload = {
            "question": intent.question,
            "title": intent.title,
            "resolution_rules": intent.resolution_rules,
            "close_time": intent.close_time.isoformat(),
            "creator_wallet": creator_wallet,
            "creator_smart_wallet": creator_smart_wallet,
            "source_twitter_id": ctx.author_id,
            "source_tweet_url": ctx.tweet_url,
            "twitter_handle": ctx.author_handle,
            "locale": intent.locale,
            "creator_fee_bps": settings.chiwiwis_default_creator_fee_bps,
            "image_url": settings.chiwiwis_default_image_url,
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            r = await client.post(
                f"{self.base}/agent/chiwiwis/markets/deploy",
                headers=self._agent_headers(),
                json=payload,
            )
            r.raise_for_status()
            return r.json()

    async def fetch_claims_since(self, cursor: str | None) -> list[dict[str, Any]]:
        params: dict[str, Any] = {
            "filters[redeemed_at][$notNull]": "true",
            "sort[0]": "redeemed_at:asc",
            "pagination[pageSize]": "50",
            "populate[market]": "*",
        }
        if cursor:
            params["filters[redeemed_at][$gt]"] = cursor

        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.get(f"{self.base}/claims", headers=self._strapi_headers(), params=params)
            r.raise_for_status()
            data = r.json()
            return data.get("data") or []

    async def fetch_leaderboard(self, period: int | None = None) -> list[dict[str, Any]]:
        params = {}
        if period:
            params["period"] = str(period)
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.get(f"{self.base}/agent/chiwiwis/leaderboard", params=params)
            r.raise_for_status()
            return (r.json().get("data") or [])
