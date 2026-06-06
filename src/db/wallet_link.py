"""Agent-side X ↔ wallet linking (Postgres — survives restarts)."""

from __future__ import annotations

import logging
import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any

from src.config import settings
from src.db.pool import db_conn

logger = logging.getLogger(__name__)


@dataclass
class WalletLink:
    twitter_id: str
    wallet_address: str
    smart_wallet_address: str | None
    twitter_handle: str | None
    referral_code: str


def get_wallet_by_address(wallet_address: str) -> WalletLink | None:
    wallet = wallet_address.lower()
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT twitter_id, wallet_address, smart_wallet_address, twitter_handle, referral_code
                FROM wallet_links
                WHERE lower(wallet_address) = %s OR lower(smart_wallet_address) = %s
                LIMIT 1
                """,
                (wallet, wallet),
            )
            row = cur.fetchone()
    if not row:
        return None
    return WalletLink(
        twitter_id=row["twitter_id"],
        wallet_address=row["wallet_address"],
        smart_wallet_address=row.get("smart_wallet_address"),
        twitter_handle=row.get("twitter_handle"),
        referral_code=row["referral_code"],
    )


def list_demo_markets_for_wallet(
    wallet_address: str,
    smart_wallet_address: str | None = None,
) -> list[dict[str, Any]]:
    wallets = {wallet_address.lower()}
    if smart_wallet_address:
        wallets.add(smart_wallet_address.lower())
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT dm.payload, wl.twitter_id, wl.twitter_handle
                FROM demo_markets dm
                LEFT JOIN wallet_links wl ON (
                  lower(wl.wallet_address) = lower(dm.payload->>'creator_wallet')
                  OR lower(wl.smart_wallet_address) = lower(dm.payload->>'creator_wallet')
                )
                WHERE lower(dm.payload->>'creator_wallet') = ANY(%s)
                ORDER BY dm.created_at DESC
                """,
                (list(wallets),),
            )
            rows = cur.fetchall()
    markets: list[dict[str, Any]] = []
    for row in rows:
        payload = dict(row["payload"])
        if not payload.get("creator_twitter_id") and row.get("twitter_id"):
            payload["creator_twitter_id"] = row["twitter_id"]
        if not payload.get("creator_twitter_handle") and row.get("twitter_handle"):
            payload["creator_twitter_handle"] = row["twitter_handle"]
        markets.append(payload)
    return markets


def list_demo_markets_recent(limit: int = 24) -> list[dict[str, Any]]:
    capped = max(1, min(limit, 100))
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT dm.payload, wl.twitter_id, wl.twitter_handle
                FROM demo_markets dm
                LEFT JOIN wallet_links wl ON (
                  lower(wl.wallet_address) = lower(dm.payload->>'creator_wallet')
                  OR lower(wl.smart_wallet_address) = lower(dm.payload->>'creator_wallet')
                )
                ORDER BY dm.created_at DESC
                LIMIT %s
                """,
                (capped,),
            )
            rows = cur.fetchall()
    markets: list[dict[str, Any]] = []
    for row in rows:
        payload = dict(row["payload"])
        if not payload.get("creator_twitter_id") and row.get("twitter_id"):
            payload["creator_twitter_id"] = row["twitter_id"]
        if not payload.get("creator_twitter_handle") and row.get("twitter_handle"):
            payload["creator_twitter_handle"] = row["twitter_handle"]
        markets.append(payload)
    return markets


def get_wallet_by_twitter(twitter_id: str) -> WalletLink | None:
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT twitter_id, wallet_address, smart_wallet_address, twitter_handle, referral_code
                FROM wallet_links WHERE twitter_id = %s
                """,
                (twitter_id,),
            )
            row = cur.fetchone()
    if not row:
        return None
    return WalletLink(
        twitter_id=row["twitter_id"],
        wallet_address=row["wallet_address"],
        smart_wallet_address=row.get("smart_wallet_address"),
        twitter_handle=row.get("twitter_handle"),
        referral_code=row["referral_code"],
    )


def create_link_token(twitter_id: str, twitter_handle: str | None = None, tweet_id: str | None = None, ttl_minutes: int = 60) -> str:
    token = secrets.token_hex(24)
    expires = datetime.now(timezone.utc) + timedelta(minutes=ttl_minutes)
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO link_tokens (token, twitter_id, twitter_handle, tweet_id, expires_at)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (token, twitter_id, twitter_handle, tweet_id, expires),
            )
        conn.commit()
    return token


def peek_link_token(token: str) -> dict[str, Any] | None:
    now = datetime.now(timezone.utc)
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT twitter_id, twitter_handle, expires_at
                FROM link_tokens
                WHERE token = %s AND used_at IS NULL AND expires_at > %s
                """,
                (token, now),
            )
            row = cur.fetchone()
    if not row:
        return None
    return {
        "twitter_id": row["twitter_id"],
        "twitter_handle": row.get("twitter_handle"),
        "expires_at": row["expires_at"].isoformat(),
    }


def complete_link_token(
    token: str,
    wallet_address: str,
    smart_wallet_address: str | None = None,
    *,
    verified_twitter_id: str,
) -> WalletLink:
    now = datetime.now(timezone.utc)
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT token, twitter_id, twitter_handle FROM link_tokens
                WHERE token = %s AND used_at IS NULL AND expires_at > %s
                """,
                (token, now),
            )
            row = cur.fetchone()
            if not row:
                raise ValueError("link-token-invalid")
            if str(row["twitter_id"]) != str(verified_twitter_id):
                raise ValueError("link-x-identity-mismatch")

            referral_code = secrets.token_hex(4).upper()
            wallet = wallet_address.lower()
            smart = smart_wallet_address.lower() if smart_wallet_address else None

            cur.execute(
                """
                INSERT INTO wallet_links (twitter_id, wallet_address, smart_wallet_address, twitter_handle, referral_code)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (twitter_id) DO UPDATE SET
                  wallet_address = EXCLUDED.wallet_address,
                  smart_wallet_address = EXCLUDED.smart_wallet_address,
                  twitter_handle = COALESCE(EXCLUDED.twitter_handle, wallet_links.twitter_handle),
                  referral_code = COALESCE(wallet_links.referral_code, EXCLUDED.referral_code),
                  updated_at = NOW()
                RETURNING twitter_id, wallet_address, smart_wallet_address, twitter_handle, referral_code
                """,
                (row["twitter_id"], wallet, smart, row.get("twitter_handle"), referral_code),
            )
            saved = cur.fetchone()
            cur.execute("UPDATE link_tokens SET used_at = %s WHERE token = %s", (now, token))
        conn.commit()

    return WalletLink(
        twitter_id=saved["twitter_id"],
        wallet_address=saved["wallet_address"],
        smart_wallet_address=saved.get("smart_wallet_address"),
        twitter_handle=saved.get("twitter_handle"),
        referral_code=saved["referral_code"],
    )


def save_demo_market(document_id: str, payload: dict[str, Any]) -> None:
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO demo_markets (document_id, payload, created_at)
                VALUES (%s, %s::jsonb, NOW())
                ON CONFLICT (document_id) DO UPDATE SET payload = EXCLUDED.payload
                """,
                (document_id, __import__("json").dumps(payload)),
            )
        conn.commit()


def get_demo_market(document_id: str) -> dict[str, Any] | None:
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT payload FROM demo_markets WHERE document_id = %s", (document_id,))
            row = cur.fetchone()
    if not row:
        return None
    return row["payload"]
