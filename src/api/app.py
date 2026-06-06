"""FastAPI BFF for Please.market web + X webhook."""

from __future__ import annotations

import hashlib
import hmac
import logging
from typing import Any

import httpx
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

from src.claims.poller import run_claims_loop
from src.config import settings
from src.db.pool import init_db
from src.db.wallet_link import (
    complete_link_token,
    create_link_token,
    get_demo_market,
    get_wallet_by_address,
    get_wallet_by_twitter,
    list_demo_markets_for_wallet,
)
from src.markets.backend import BackendClient
from src.resolution.reminders import run_reminder_loop
from src.x.client import XClient
from src.x.webhook import handle_mention_payload

logger = logging.getLogger(__name__)

app = FastAPI(title="Please.market Agent API", version="0.1.0")

_cors_origins = {
    settings.please_web_url.rstrip("/"),
    "http://localhost:3000",
}
if settings.anyone_web_base:
    _cors_origins.add(settings.anyone_web_base.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(_cors_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_backend = BackendClient()
_x = XClient()


class LinkInitBody(BaseModel):
    twitter_id: str
    twitter_handle: str | None = None
    tweet_id: str | None = None


class LinkCompleteBody(BaseModel):
    token: str
    wallet_address: str
    smart_wallet_address: str | None = None


@app.on_event("startup")
async def startup() -> None:
    init_db()
    import asyncio

    asyncio.create_task(run_claims_loop(_backend, _x))
    asyncio.create_task(run_reminder_loop(_x))


@app.get("/health")
async def health() -> dict:
    return {
        "status": "ok",
        "dry_run": settings.please_dry_run,
        "deploy_enabled": settings.agent_deploy_enabled,
        "web_base": settings.please_web_url,
        "anyone_web_base": settings.anyone_web_base,
    }


@app.get("/api/leaderboard")
async def leaderboard(period: int | None = None) -> dict:
    try:
        rows = await _backend.fetch_leaderboard(period)
    except Exception as exc:
        logger.warning("leaderboard backend failed: %s", exc)
        rows = []
    return {"data": rows}


@app.get("/api/markets/{document_id}")
async def get_market(document_id: str) -> dict[str, Any]:
    """Hackathon fallback market or proxy to Strapi."""
    demo = get_demo_market(document_id)
    if demo:
        return {"data": demo, "source": "agent"}

    if not settings.api_token:
        raise HTTPException(status_code=404, detail="market not found")

    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.get(
            f"{settings.api_url.rstrip('/')}/markets/{document_id}",
            headers={"Authorization": f"Bearer {settings.api_token}"},
            params={"populate": "*"},
        )
        if r.status_code == 404:
            r = await client.get(
                f"{settings.api_url.rstrip('/')}/markets",
                headers={"Authorization": f"Bearer {settings.api_token}"},
                params={"filters[documentId][$eq]": document_id, "populate": "*"},
            )
        if r.status_code >= 400:
            raise HTTPException(status_code=404, detail="market not found")
        body = r.json()
        data = body.get("data")
        if isinstance(data, list):
            data = data[0] if data else None
        if not data:
            raise HTTPException(status_code=404, detail="market not found")
        return {"data": data, "source": "strapi"}


@app.get("/api/demo/profile")
async def demo_profile(wallet: str) -> dict:
    link = get_wallet_by_address(wallet)
    if not link:
        return {
            "wallet_address": wallet,
            "twitter_handle": None,
            "referral_code": None,
            "demo_mode": True,
        }
    return {
        "wallet_address": link.wallet_address,
        "smart_wallet_address": link.smart_wallet_address,
        "twitter_handle": link.twitter_handle,
        "referral_code": link.referral_code,
        "twitter_id": link.twitter_id,
        "demo_mode": True,
    }


@app.get("/api/demo/markets")
async def demo_markets(wallet: str, smart_wallet: str | None = None) -> dict:
    rows = list_demo_markets_for_wallet(wallet, smart_wallet)
    return {
        "data": rows,
        "stats": {"volume_usdc": 0, "trade_count": len(rows), "market_count": len(rows)},
        "demo_mode": True,
    }


@app.get("/api/wallet/{twitter_id}")
async def wallet_lookup(twitter_id: str) -> dict:
    link = get_wallet_by_twitter(twitter_id)
    if not link:
        raise HTTPException(status_code=404, detail="not linked")
    return {
        "wallet_address": link.wallet_address,
        "smart_wallet_address": link.smart_wallet_address,
        "referral_code": link.referral_code,
        "twitter_handle": link.twitter_handle,
    }


@app.post("/api/link-x/init")
async def link_x_init(body: LinkInitBody) -> dict:
    token = create_link_token(body.twitter_id, body.twitter_handle, body.tweet_id)
    web = settings.please_web_url.rstrip("/")
    return {"token": token, "link_url": f"{web}/link-x?token={token}"}


@app.post("/api/link-x/complete")
async def link_x_complete(body: LinkCompleteBody) -> dict:
    try:
        link = complete_link_token(body.token, body.wallet_address, body.smart_wallet_address)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    # Best-effort sync to org backend when configured
    if settings.agent_service_secret:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                await client.post(
                    f"{settings.api_url.rstrip('/')}/agent/please-market/link-x/complete",
                    json={
                        "token": body.token,
                        "wallet_address": link.wallet_address,
                        "smart_wallet_address": link.smart_wallet_address,
                    },
                )
        except Exception as exc:
            logger.info("backend link sync skipped: %s", exc)

    return {
        "twitter_id": link.twitter_id,
        "wallet_address": link.wallet_address,
        "referral_code": link.referral_code,
    }


@app.post("/api/x/webhook")
async def x_webhook(request: Request, x_twitter_webhooks_signature: str | None = Header(default=None)) -> dict:
    body = await request.body()
    if settings.x_api_secret and x_twitter_webhooks_signature:
        if not _verify_signature(body, x_twitter_webhooks_signature):
            raise HTTPException(status_code=401, detail="invalid signature")

    payload = await request.json()
    await handle_mention_payload(payload, _backend, _x)
    return {"ok": True}


@app.get("/api/x/webhook")
async def x_crc(crc_token: str) -> dict:
    if not settings.x_api_secret:
        return {"response_token": crc_token}
    digest = hmac.new(settings.x_api_secret.encode(), crc_token.encode(), hashlib.sha256).digest()
    import base64

    return {"response_token": base64.b64encode(digest).decode()}


@app.get("/s/{ref}/{market_id}")
async def short_link(ref: str, market_id: str, src: str = "please_market_short") -> RedirectResponse:
    target = f"{settings.anyone_web_base.rstrip('/')}/en/market/{market_id}?ref={ref}&src={src}"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.post(
                f"{settings.api_url.rstrip('/')}/referral-clicks",
                json={"ref_code_used": ref, "marketId": market_id, "src": src},
            )
    except Exception as exc:
        logger.warning("referral click log failed: %s", exc)
    return RedirectResponse(url=target, status_code=302)


def _verify_signature(body: bytes, signature: str) -> bool:
    secret = settings.x_api_secret.encode()
    expected = hmac.new(secret, body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)
