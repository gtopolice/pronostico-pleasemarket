"""X/Twitter API client for replies and timeline posts."""

from __future__ import annotations

import logging

import httpx

from src.config import settings

logger = logging.getLogger(__name__)


class XClient:
    def __init__(self) -> None:
        self.bearer = settings.x_api_bearer_token

    async def reply(self, in_reply_to_tweet_id: str, text: str) -> str | None:
        if not self.bearer:
            logger.info("X reply (dry): in_reply_to=%s text=%s", in_reply_to_tweet_id, text[:80])
            return f"dry-{in_reply_to_tweet_id}"

        payload = {"text": text[:280], "reply": {"in_reply_to_tweet_id": in_reply_to_tweet_id}}
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(
                "https://api.twitter.com/2/tweets",
                headers={"Authorization": f"Bearer {self.bearer}", "Content-Type": "application/json"},
                json=payload,
            )
            if r.status_code >= 400:
                logger.error("X reply failed: %s %s", r.status_code, r.text)
                return None
            data = r.json()
            return data.get("data", {}).get("id")

    async def post_timeline(self, text: str, quote_tweet_id: str | None = None) -> str | None:
        if not self.bearer:
            logger.info("X post (dry): %s", text[:80])
            return "dry-timeline"

        payload: dict = {"text": text[:280]}
        if quote_tweet_id:
            payload["quote_tweet_id"] = quote_tweet_id

        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(
                "https://api.twitter.com/2/tweets",
                headers={"Authorization": f"Bearer {self.bearer}", "Content-Type": "application/json"},
                json=payload,
            )
            if r.status_code >= 400:
                logger.error("X post failed: %s %s", r.status_code, r.text)
                return None
            return r.json().get("data", {}).get("id")
