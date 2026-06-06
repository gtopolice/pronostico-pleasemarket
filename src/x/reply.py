"""Compose Please.market X reply comments."""

from __future__ import annotations

from src.intent.models import MarketIntent


def compose_deploy_reply(
    intent: MarketIntent,
    market_url: str,
    document_id: str,
    reputation_score: float = 50.0,
    dry_run: bool = False,
) -> str:
    return "\n".join(
        [
            "Your market is live on please.market!",
            intent.question,
            market_url,
        ]
    )


def compose_link_wallet_reply(link_url: str) -> str:
    return f"Click the link below to link your wallet and create a market — powered by @Anyone_Market\n{link_url}"


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
