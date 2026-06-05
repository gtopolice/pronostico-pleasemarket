"""Post-close resolution reminders and SLA tracking."""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta, timezone

from src.config import settings
from src.db.pool import db_conn
from src.x.client import XClient
from src.x.reply import compose_reject_reply

logger = logging.getLogger(__name__)


def register_obligation(market_document_id: str, twitter_id: str, close_time: datetime, deploy_tweet_id: str | None) -> None:
    sla = close_time + timedelta(hours=settings.chiwiwis_resolve_sla_hours)
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO resolve_obligations (market_document_id, twitter_id, close_time, sla_deadline, deploy_tweet_id)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (market_document_id) DO NOTHING
                """,
                (market_document_id, twitter_id, close_time, sla, deploy_tweet_id),
            )
        conn.commit()


async def run_reminder_loop(x: XClient) -> None:
    while True:
        try:
            await _tick_reminders(x)
        except Exception as exc:
            logger.exception("reminder loop error: %s", exc)
        await asyncio.sleep(300)


async def _tick_reminders(x: XClient) -> None:
    now = datetime.now(timezone.utc)
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT * FROM resolve_obligations
                WHERE status = 'pending' AND close_time <= %s
                ORDER BY close_time ASC LIMIT 20
                """,
                (now,),
            )
            rows = cur.fetchall()

    for row in rows:
        deploy_tweet = row.get("deploy_tweet_id")
        if not deploy_tweet:
            continue
        hours_past = (now - row["close_time"]).total_seconds() / 3600
        if hours_past >= settings.chiwiwis_resolve_sla_hours:
            _mark_escalation(row["market_document_id"])
            continue
        if hours_past < 1:
            msg = f"Market closed — resolve within {settings.chiwiwis_resolve_sla_hours}h: {settings.chiwiwis_web_url}/dashboard/resolve"
        else:
            msg = f"Reminder: resolve your market ▲ {settings.chiwiwis_web_url}/dashboard/resolve"
        await x.reply(deploy_tweet, msg[:280])


def _mark_escalation(market_document_id: str) -> None:
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE resolve_obligations SET status = 'platform_escalation' WHERE market_document_id = %s",
                (market_document_id,),
            )
        conn.commit()
    logger.info("Escalated market %s to platform resolution", market_document_id)
