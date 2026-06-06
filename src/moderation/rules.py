"""Moderation, rate limits, kill switch, audit."""

from __future__ import annotations

import json
import logging
import re
from datetime import datetime, timezone

from src.config import settings
from src.db.pool import db_conn
from src.intent.models import MarketIntent, TweetContext

logger = logging.getLogger(__name__)

_SPAM_PATTERNS = [
    re.compile(r"https?://\S+", re.I),
    re.compile(r"(?i)(free money|airdrop|casino|porn|xxx)"),
]

_ILLEGAL_PATTERNS = [
    re.compile(r"(?i)(kill|murder|assassinate|bomb|terror)"),
]


def audit(event_type: str, twitter_id: str | None = None, tweet_id: str | None = None, payload: dict | None = None) -> None:
    try:
        with db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO audit_log (event_type, twitter_id, tweet_id, payload) VALUES (%s, %s, %s, %s::jsonb)",
                    (event_type, twitter_id, tweet_id, json.dumps(payload or {})),
                )
            conn.commit()
    except Exception as exc:
        logger.warning("audit log failed: %s", exc)


def is_kill_switch_active() -> bool:
    return settings.please_global_kill_switch or not settings.agent_deploy_enabled


def check_user_rate_limit(twitter_id: str) -> tuple[bool, str | None]:
    limit = settings.please_rate_limit_per_user_day
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT COUNT(*) AS cnt FROM processed_mentions
                WHERE author_id = %s AND processed_at > NOW() - INTERVAL '1 day'
                  AND action IN ('deploy', 'dry_run')
                """,
                (twitter_id,),
            )
            row = cur.fetchone()
    count = int(row["cnt"]) if row else 0
    if count >= limit:
        return False, f"Rate limit: max {limit} markets per day."
    return True, None


def moderate_intent(ctx: TweetContext, intent: MarketIntent) -> tuple[bool, str | None]:
    if intent.reject:
        return False, intent.reject_reason or "Could not create this market."

    text_blob = " ".join(filter(None, [ctx.text, ctx.parent_text, ctx.quoted_text, intent.question]))
    for pat in _ILLEGAL_PATTERNS:
        if pat.search(text_blob):
            audit("moderation_reject", ctx.author_id, ctx.tweet_id, {"reason": "illegal"})
            return False, "This request cannot be processed."

    spam_links = len(re.findall(r"https?://", text_blob))
    if spam_links > 3:
        return False, "Too many links — try a simpler market prompt."

    if intent.confidence < 0.35:
        return False, "I couldn't understand that market. Try: @PleaseMarketBot Will X happen by [date]?"

    now = datetime.now(timezone.utc)
    if intent.close_time <= now:
        return False, "Close time must be in the future."

    return True, None


def is_allowlisted(author_id: str) -> bool:
    allow = settings.allowlist_ids()
    if not allow:
        return True
    return author_id in allow


def mention_already_processed(tweet_id: str) -> bool:
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM processed_mentions WHERE tweet_id = %s", (tweet_id,))
            return cur.fetchone() is not None


def get_mention_action(tweet_id: str) -> str | None:
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT action FROM processed_mentions WHERE tweet_id = %s", (tweet_id,))
            row = cur.fetchone()
    return row["action"] if row else None


def record_mention(tweet_id: str, author_id: str, action: str, market_document_id: str | None = None, reply_tweet_id: str | None = None) -> None:
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO processed_mentions (tweet_id, author_id, action, market_document_id, reply_tweet_id)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (tweet_id) DO NOTHING
                """,
                (tweet_id, author_id, action, market_document_id, reply_tweet_id),
            )
        conn.commit()


def update_mention_record(
    tweet_id: str,
    action: str,
    market_document_id: str | None = None,
    reply_tweet_id: str | None = None,
) -> None:
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE processed_mentions
                SET action = %s, market_document_id = %s, reply_tweet_id = %s, processed_at = NOW()
                WHERE tweet_id = %s
                """,
                (action, market_document_id, reply_tweet_id, tweet_id),
            )
        conn.commit()
