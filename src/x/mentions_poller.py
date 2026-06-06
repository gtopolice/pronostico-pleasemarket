"""Poll X mention timeline for @PleaseMarketBot and feed the webhook handler."""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from src.config import settings
from src.markets.backend import BackendClient
from src.x.client import XClient
from src.x.webhook import handle_mention_payload

logger = logging.getLogger(__name__)

_since_id: str | None = None
_bootstrap_done = False
_bot_user_id: str | None = None


async def run_mentions_loop(backend: BackendClient, x: XClient) -> None:
    global _bot_user_id

    if not settings.mentions_poll_enabled:
        logger.info("mentions poll disabled (MENTIONS_POLL_ENABLED=0)")
        return
    if not x.bearer:
        logger.info("mentions poll disabled: X_API_BEARER_TOKEN not set")
        return

    _bot_user_id = await _resolve_bot_user_id(x)
    if not _bot_user_id:
        logger.warning("mentions poll disabled: set X_BOT_USER_ID or ensure PLEASE_X_HANDLE resolves")
        return

    logger.info("mentions poll started for bot user id=%s handle=@%s", _bot_user_id, settings.please_x_handle)

    while True:
        try:
            await _poll_mentions(backend, x, _bot_user_id)
        except Exception as exc:
            logger.exception("mentions loop error: %s", exc)
        await asyncio.sleep(settings.mentions_poll_interval_seconds)


async def _resolve_bot_user_id(x: XClient) -> str | None:
    if settings.x_bot_user_id.strip():
        return settings.x_bot_user_id.strip()

    handle = settings.please_x_handle.strip().lstrip("@")
    if not handle:
        return None

    data = await x.get_json(f"https://api.twitter.com/2/users/by/username/{handle}")
    if not data:
        return None

    user_id = (data.get("data") or {}).get("id")
    if user_id:
        logger.info("resolved @%s to user id %s", handle, user_id)
    return str(user_id) if user_id else None


async def _poll_mentions(backend: BackendClient, x: XClient, bot_user_id: str) -> None:
    global _since_id, _bootstrap_done

    params: dict[str, Any] = {
        "max_results": 10,
        "tweet.fields": "author_id,created_at",
        "expansions": "author_id",
        "user.fields": "username,profile_image_url",
    }
    if _since_id:
        params["since_id"] = _since_id

    data = await x.get_json(
        f"https://api.twitter.com/2/users/{bot_user_id}/mentions",
        params=params,
    )
    if not data:
        return

    tweets = data.get("data") or []
    if not tweets:
        return

    newest_id = max(str(tweet["id"]) for tweet in tweets)

    if not _bootstrap_done and _since_id is None:
        _since_id = newest_id
        _bootstrap_done = True
        logger.info("mentions poller bootstrapped at since_id=%s (skipped backlog)", _since_id)
        return

    users = {
        str(user["id"]): {
            "username": user.get("username"),
            "profile_image_url": user.get("profile_image_url"),
        }
        for user in (data.get("includes") or {}).get("users") or []
    }

    for tweet in sorted(tweets, key=lambda row: int(row["id"])):
        tweet_id = str(tweet["id"])
        if _since_id and int(tweet_id) <= int(_since_id):
            continue

        author_id = str(tweet.get("author_id", ""))
        if author_id == bot_user_id:
            _since_id = tweet_id
            continue

        author = users.get(author_id) or {}
        await handle_mention_payload(
            {
                "tweet_id": tweet_id,
                "author_id": author_id,
                "author_handle": author.get("username"),
                "author_profile_image_url": author.get("profile_image_url"),
                "text": tweet.get("text") or "",
            },
            backend,
            x,
        )
        _since_id = tweet_id
