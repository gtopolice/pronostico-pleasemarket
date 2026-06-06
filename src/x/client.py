"""X/Twitter API client for replies and timeline posts."""

from __future__ import annotations

import asyncio
import logging
from typing import Any

import httpx
import requests
from requests_oauthlib import OAuth1

from src.config import settings

logger = logging.getLogger(__name__)

_POST_URL = "https://api.twitter.com/2/tweets"


class XClient:
    def __init__(self) -> None:
        self.bearer = settings.x_api_bearer_token
        self._oauth: OAuth1 | None = None
        if all(
            (
                settings.x_api_key,
                settings.x_api_secret,
                settings.x_access_token,
                settings.x_access_token_secret,
            )
        ):
            self._oauth = OAuth1(
                settings.x_api_key,
                settings.x_api_secret,
                settings.x_access_token,
                settings.x_access_token_secret,
            )

    def can_post(self) -> bool:
        return self._oauth is not None

    async def reply(self, in_reply_to_tweet_id: str, text: str) -> str | None:
        payload = {"text": text[:280], "reply": {"in_reply_to_tweet_id": in_reply_to_tweet_id}}
        if not self._oauth:
            logger.info("X reply (dry): in_reply_to=%s text=%s", in_reply_to_tweet_id, text[:80])
            return f"dry-{in_reply_to_tweet_id}"
        return await self._post_tweet(payload, "reply")

    async def post_timeline(self, text: str, quote_tweet_id: str | None = None) -> str | None:
        if not self._oauth:
            logger.info("X post (dry): %s", text[:80])
            return "dry-timeline"

        payload: dict[str, Any] = {"text": text[:280]}
        if quote_tweet_id:
            payload["quote_tweet_id"] = quote_tweet_id
        return await self._post_tweet(payload, "timeline")

    async def _post_tweet(self, payload: dict[str, Any], kind: str) -> str | None:
        assert self._oauth is not None

        def _do() -> requests.Response:
            return requests.post(_POST_URL, auth=self._oauth, json=payload, timeout=30)

        try:
            response = await asyncio.to_thread(_do)
        except Exception as exc:
            logger.error("X %s failed: %s", kind, exc)
            return None

        if response.status_code >= 400:
            logger.error("X %s failed: %s %s", kind, response.status_code, response.text)
            return None

        tweet_id = response.json().get("data", {}).get("id")
        if tweet_id:
            logger.info("X %s ok: tweet_id=%s", kind, tweet_id)
        return tweet_id

    async def get_json(self, url: str, params: dict[str, Any] | None = None) -> dict[str, Any] | None:
        if not self.bearer:
            return None
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                url,
                headers={"Authorization": f"Bearer {self.bearer}"},
                params=params,
            )
            if response.status_code >= 400:
                logger.error("X GET failed: %s %s %s", url, response.status_code, response.text)
                return None
            return response.json()
