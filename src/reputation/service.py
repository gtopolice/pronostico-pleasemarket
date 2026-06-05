"""Creator reputation tiers and scoring."""

from __future__ import annotations

from src.db.pool import db_conn

TIERS = ("new", "good", "trusted", "restricted")


def get_score(twitter_id: str) -> float:
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT score FROM creator_reputation WHERE twitter_id = %s", (twitter_id,))
            row = cur.fetchone()
    return float(row["score"]) if row else 50.0


def get_tier(twitter_id: str) -> str:
    score = get_score(twitter_id)
    if score < 30:
        return "restricted"
    if score >= 80:
        return "trusted"
    if score >= 60:
        return "good"
    return "new"


def record_market_created(twitter_id: str, handle: str | None = None) -> None:
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO creator_reputation (twitter_id, twitter_handle, markets_created, score)
                VALUES (%s, %s, 1, 50)
                ON CONFLICT (twitter_id) DO UPDATE SET
                  markets_created = creator_reputation.markets_created + 1,
                  twitter_handle = COALESCE(EXCLUDED.twitter_handle, creator_reputation.twitter_handle),
                  updated_at = NOW()
                """,
                (twitter_id, handle),
            )
        conn.commit()


def can_create(twitter_id: str) -> tuple[bool, str | None]:
    tier = get_tier(twitter_id)
    if tier == "restricted":
        return False, "Creator account restricted — resolve overdue markets first."
    return True, None
