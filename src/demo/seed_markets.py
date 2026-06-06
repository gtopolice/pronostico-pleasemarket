"""Static preview markets for hackathon demo grids."""

from __future__ import annotations

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
    },
]

SEED_DEMO_MARKETS = [_enrich_seed_market(row) for row in _RAW_SEED_DEMO_MARKETS]

_SEED_BY_ID = {row["documentId"]: row for row in SEED_DEMO_MARKETS}


def get_seed_market(document_id: str) -> dict[str, Any] | None:
    row = _SEED_BY_ID.get(document_id)
    return dict(row) if row else None


def merge_market_list(db_rows: list[dict[str, Any]], limit: int) -> list[dict[str, Any]]:
    """Seed markets first, then live preview markets; dedupe by documentId."""
    capped = max(1, min(limit, 100))
    seen: set[str] = set()
    merged: list[dict[str, Any]] = []

    for row in [*SEED_DEMO_MARKETS, *db_rows]:
        doc_id = row.get("documentId")
        if not doc_id or doc_id in seen:
            continue
        seen.add(doc_id)
        merged.append(row)
        if len(merged) >= capped:
            break

    return merged
