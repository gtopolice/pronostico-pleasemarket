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
    if intent.locale == "es":
        headline = "¡Tu mercado ya está en please.market!"
    else:
        headline = "Your market is live on please.market!"
    return "\n".join([headline, intent.question, market_url])


def compose_link_wallet_reply(link_url: str, locale: str = "en") -> str:
    if locale == "es":
        return (
            "Vincula tu billetera con el enlace de abajo para crear un mercado — "
            f"impulsado por @Anyone_Market\n{link_url}"
        )
    return f"Click the link below to link your wallet and create a market — powered by @Anyone_Market\n{link_url}"


def compose_reject_reply(reason: str, locale: str = "en") -> str:
    if locale == "es":
        return f"No puedo crear ese mercado: {reason}"
    return f"Can't create that market: {reason}"


def compose_share_reply(market_title: str, share_url: str, locale: str = "en") -> str:
    if locale == "es":
        return (
            f"Opera esto ▲ {market_title}\n"
            f"{share_url}\n"
            "Referiste → 10% de comisiones en tus compras atribuidas."
        )
    return (
        f"Trade this ▲ {market_title}\n"
        f"{share_url}\n"
        "You referred → 10% of fees on your attributed buys."
    )


def compose_claim_post(trader: str, reward_usdc: float, market_title: str, market_url: str) -> str:
    return (
        f"💰 Cobro — {trader} cobró {reward_usdc:.2f} MXNB en\n"
        f"▲ {market_title}\n{market_url}"
    )
