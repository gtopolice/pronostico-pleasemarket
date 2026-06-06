"""Compose Please.market X reply comments."""

from __future__ import annotations

from datetime import datetime

from src.config import settings
from src.intent.models import MarketIntent


def format_close_time(close: datetime) -> str:
    return close.strftime("%Y-%m-%d %H:%M UTC")


def compose_deploy_reply(
    intent: MarketIntent,
    market_url: str,
    document_id: str,
    reputation_score: float = 50.0,
    dry_run: bool = False,
) -> str:
    prefix = "🔍 Preview — " if dry_run else "▲ "
    lines = [
        f"{prefix}Market live on Please.market",
        "",
        intent.question,
        "",
        f"Closes: {format_close_time(intent.close_time)}",
        f"Trade: {market_url}",
        "",
        "Rules:",
        intent.resolution_rules[:400],
        "",
        "You tagged → you resolve within 48h after close.",
        f"Creator score: {reputation_score:.0f}/100",
        f"Resolve: {settings.please_web_url}/dashboard/resolve",
    ]
    if dry_run:
        lines.append("")
        lines.append("(Dry run — no market deployed yet)")
    return "\n".join(lines)


def compose_link_wallet_reply(link_url: str) -> str:
    return f"Link your wallet to create markets on Anyone ▲\n{link_url}"


def compose_reject_reply(reason: str) -> str:
    return f"Can't create that market: {reason}"


def compose_share_reply(market_title: str, share_url: str) -> str:
    return (
        f"Trade this ▲ {market_title}\n"
        f"{share_url}\n"
        "You referred → 10% of fees on your attributed buys."
    )


def compose_claim_post(trader: str, reward_usdc: float, market_title: str, market_url: str) -> str:
    return (
        f"💰 Cobro — {trader} redeemed ${reward_usdc:.2f} on\n"
        f"▲ {market_title}\n{market_url}"
    )
