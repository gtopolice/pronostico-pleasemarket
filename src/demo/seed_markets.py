"""Static preview markets for hackathon demo grids."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

# Demo creator avatars are served from the web app at /assets/creators/
_DEMO_CREATOR_AVATAR_BY_HANDLE: dict[str, str] = {
    "anyone": "/assets/creators/anyone.png",
    "ballknower": "/assets/creators/ballknower.jpg",
    "degenqueen": "/assets/creators/degenqueen.jpg",
    "eminence": "/assets/creators/eminence.png",
    "goldbug": "/assets/creators/goldbug.jpg",
    "oracle": "/assets/creators/oracle.jpg",
    "popcorn": "/assets/creators/popcorn.png",
    "satoshi": "/assets/creators/satoshi.jpg",
    "wallstbets": "/assets/creators/wallstbets.webp",
}


def _enrich_seed_market(row: dict[str, Any]) -> dict[str, Any]:
    out = dict(row)
    handle = (out.get("creator_twitter_handle") or "").lower()
    if not out.get("creator_profile_image_url") and handle in _DEMO_CREATOR_AVATAR_BY_HANDLE:
        out["creator_profile_image_url"] = _DEMO_CREATOR_AVATAR_BY_HANDLE[handle]
    return out


_RAW_SEED_DEMO_MARKETS: list[dict[str, Any]] = [
    {
        "documentId": "seed-ethmex-sellout-2026",
        "question": "¿Ganará un proyecto de pagos con MXNB el track startup de Bitso en ETH Mexico 2026?",
        "title": "¿Ganará un proyecto MXNB el track startup de Bitso en ETH Mexico 2026?",
        "resolution_rules": (
            "Resuelve SÍ si el jurado de Bitso anuncia como ganador del track startup a un proyecto "
            "cuyo producto use MXNB como moneda principal de settlement o pagos on-chain. "
            "Fuente: anuncio oficial del hackathon ETH Mexico 2026 × Bitso. Resuelve NO en caso contrario."
        ),
        "close_time_utc": "2026-06-08T05:59:59+00:00",
        "state": "PREVIEW",
        "dry_run": True,
        "demo_seed": True,
        "locale": "es",
        "creator_twitter_handle": "anyone",
        "created_at": "2026-06-05T12:00:00+00:00",
    },
    {
        "documentId": "seed-anyone-1m-volume-june",
        "question": "¿Anyone alcanzará 1 millón MXNB en volumen antes del 30 de junio 2026?",
        "title": "¿Anyone alcanzará 1M MXNB en volumen para fin de junio 2026?",
        "resolution_rules": (
            "Resuelve SÍ si el volumen acumulado en anyone.market supera 1,000,000 MXNB "
            "antes del 30 jun 2026 23:59 GMT. Fuente: métricas públicas del protocolo."
        ),
        "close_time_utc": "2026-06-30T23:59:59+00:00",
        "state": "PREVIEW",
        "dry_run": True,
        "demo_seed": True,
        "locale": "es",
        "creator_twitter_handle": "anyone",
        "created_at": "2026-06-05T11:00:00+00:00",
    },
    {
        "documentId": "seed-base-10m-daily-txs-q2",
        "question": "¿Base superará 10M transacciones diarias en Q2 2026?",
        "title": "¿Base superará 10M transacciones diarias en Q2 2026?",
        "resolution_rules": (
            "Resuelve SÍ si Base registra al menos un día con ≥10M transacciones en Q2 2026. "
            "Fuente: BaseScan / métricas oficiales de Base."
        ),
        "close_time_utc": "2026-06-30T23:59:59+00:00",
        "state": "PREVIEW",
        "dry_run": True,
        "demo_seed": True,
        "locale": "es",
        "creator_twitter_handle": "oracle",
        "created_at": "2026-06-05T10:00:00+00:00",
    },
    {
        "documentId": "seed-bitso-l2-token-july",
        "question": "¿Bitso anunciará un token L2 antes de julio 2026?",
        "title": "¿Bitso anunciará un token L2 antes de julio 2026?",
        "resolution_rules": (
            "Resuelve SÍ si Bitso publica un anuncio oficial sobre un token en una L2 de Ethereum "
            "antes del 1 jul 2026. Resuelve NO en caso contrario."
        ),
        "close_time_utc": "2026-07-01T05:59:59+00:00",
        "state": "PREVIEW",
        "dry_run": True,
        "demo_seed": True,
        "locale": "es",
        "creator_twitter_handle": "degenqueen",
        "created_at": "2026-06-05T09:00:00+00:00",
    },
    {
        "documentId": "seed-ethmex-hackathon-100-buidls",
        "question": "¿ETH Mexico 2026 superará 100 proyectos en DoraHacks?",
        "title": "¿ETH Mexico 2026 superará 100 BUIDLs en DoraHacks?",
        "resolution_rules": (
            "Resuelve SÍ si el hackathon ETH Mexico 2026 × Bitso registra más de 100 BUIDLs "
            "antes del cierre de submissions. Fuente: página oficial del hackathon."
        ),
        "close_time_utc": "2026-06-05T23:59:59+00:00",
        "state": "PREVIEW",
        "dry_run": True,
        "demo_seed": True,
        "locale": "es",
        "creator_twitter_handle": "eminence",
        "created_at": "2026-06-05T08:00:00+00:00",
    },
    {
        "documentId": "seed-wc-argentina-win-2026",
        "question": "Will Argentina win the World Cup 2026?",
        "title": "Will Argentina win the World Cup 2026?",
        "resolution_rules": (
            "Resolves YES if Argentina wins the FIFA World Cup 2026 final. "
            "Resolves NO otherwise. Source: FIFA official results."
        ),
        "close_time_utc": "2026-07-19T23:59:59+00:00",
        "state": "PREVIEW",
        "dry_run": True,
        "demo_seed": True,
        "creator_twitter_handle": "ballknower",
        "created_at": "2026-05-28T18:00:00+00:00",
    },
    {
        "documentId": "seed-wc-uruguay-group-2026",
        "question": "Will Uruguay pass the World Cup 2026 group stage?",
        "title": "Will Uruguay pass the World Cup 2026 group stage?",
        "resolution_rules": (
            "Resolves YES if Uruguay advances out of the group stage at World Cup 2026. "
            "Resolves NO if eliminated in the group stage."
        ),
        "close_time_utc": "2026-06-28T23:59:59+00:00",
        "state": "PREVIEW",
        "dry_run": True,
        "demo_seed": True,
        "creator_twitter_handle": "ballknower",
        "created_at": "2026-05-29T18:00:00+00:00",
    },
    {
        "documentId": "seed-wc-host-nation-final-2026",
        "question": "Will a host nation (USA/MEX/CAN) reach the World Cup 2026 final?",
        "title": "Will a host nation (USA/MEX/CAN) reach the World Cup 2026 final?",
        "resolution_rules": (
            "Resolves YES if the United States, Mexico, or Canada plays in the World Cup 2026 final. "
            "Resolves NO otherwise."
        ),
        "close_time_utc": "2026-07-14T23:59:59+00:00",
        "state": "PREVIEW",
        "dry_run": True,
        "demo_seed": True,
        "creator_twitter_handle": "ballknower",
        "created_at": "2026-05-30T18:00:00+00:00",
    },
    {
        "documentId": "seed-wc-golden-boot-7-goals",
        "question": "Will the Golden Boot winner score 7+ goals at World Cup 2026?",
        "title": "Will the Golden Boot winner score 7+ goals at World Cup 2026?",
        "resolution_rules": (
            "Resolves YES if the official Golden Boot winner at World Cup 2026 scores 7 or more goals. "
            "Resolves NO otherwise."
        ),
        "close_time_utc": "2026-07-19T23:59:59+00:00",
        "state": "PREVIEW",
        "dry_run": True,
        "demo_seed": True,
        "creator_twitter_handle": "ballknower",
        "created_at": "2026-05-31T18:00:00+00:00",
    },
    {
        "documentId": "seed-wc-usmnt-knockout-2026",
        "question": "Will the USMNT reach the World Cup 2026 quarter-finals?",
        "title": "Will the USMNT reach the World Cup 2026 quarter-finals?",
        "resolution_rules": (
            "Resolves YES if the United States men's national team reaches the quarter-finals "
            "or better at World Cup 2026. Resolves NO otherwise."
        ),
        "close_time_utc": "2026-07-10T23:59:59+00:00",
        "state": "PREVIEW",
        "dry_run": True,
        "demo_seed": True,
        "creator_twitter_handle": "oracle",
        "created_at": "2026-06-01T18:00:00+00:00",
    },
    {
        "documentId": "seed-wc-messi-starts-final",
        "question": "Will Messi start in the World Cup 2026 final if Argentina reach it?",
        "title": "Will Messi start in the World Cup 2026 final if Argentina reach it?",
        "resolution_rules": (
            "Resolves YES if Lionel Messi is in Argentina's starting lineup for the World Cup 2026 final. "
            "Resolves NA if Argentina do not reach the final; in that case resolves NO."
        ),
        "close_time_utc": "2026-07-19T20:00:00+00:00",
        "state": "PREVIEW",
        "dry_run": True,
        "demo_seed": True,
        "creator_twitter_handle": "satoshi",
        "created_at": "2026-06-02T18:00:00+00:00",
    },
]

SEED_DEMO_MARKETS = [_enrich_seed_market(row) for row in _RAW_SEED_DEMO_MARKETS]

_SEED_BY_ID = {row["documentId"]: row for row in SEED_DEMO_MARKETS}


def seed_market_count() -> int:
    return len(SEED_DEMO_MARKETS)


def get_seed_market(document_id: str) -> dict[str, Any] | None:
    row = _SEED_BY_ID.get(document_id)
    return dict(row) if row else None


def _parse_created_at(row: dict[str, Any]) -> datetime:
    raw = row.get("created_at")
    if isinstance(raw, datetime):
        return raw if raw.tzinfo else raw.replace(tzinfo=timezone.utc)
    if isinstance(raw, str) and raw.strip():
        try:
            parsed = datetime.fromisoformat(raw.replace("Z", "+00:00"))
            return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
        except ValueError:
            pass
    return datetime.min.replace(tzinfo=timezone.utc)


def _parse_sort_at(row: dict[str, Any]) -> datetime:
    for key in ("sort_at", "created_at", "updatedAt", "publishedAt", "createdAt"):
        raw = row.get(key)
        if isinstance(raw, datetime):
            return raw if raw.tzinfo else raw.replace(tzinfo=timezone.utc)
        if isinstance(raw, str) and raw.strip():
            try:
                parsed = datetime.fromisoformat(raw.replace("Z", "+00:00"))
                return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
            except ValueError:
                continue
    return datetime.min.replace(tzinfo=timezone.utc)


def merge_market_list(
    db_rows: list[dict[str, Any]],
    limit: int,
    live_rows: list[dict[str, Any]] | None = None,
) -> list[dict[str, Any]]:
    """Merge live Strapi + seed + preview markets, newest first."""
    capped = max(1, min(limit, 100))
    seen: set[str] = set()
    merged: list[dict[str, Any]] = []

    for row in [*(live_rows or []), *SEED_DEMO_MARKETS, *db_rows]:
        doc_id = row.get("documentId")
        if not doc_id or doc_id in seen:
            continue
        seen.add(doc_id)
        merged.append(row)

    merged.sort(key=_parse_sort_at, reverse=True)
    return merged[:capped]
