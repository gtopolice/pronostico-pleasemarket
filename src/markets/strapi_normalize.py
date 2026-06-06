"""Normalize Strapi market rows for Please.market web grid + trading."""

from __future__ import annotations

from typing import Any


def _positive_int(raw: Any) -> int | None:
    try:
        value = int(raw)
    except (TypeError, ValueError):
        return None
    return value if value > 0 else None


def _valid_address(raw: Any) -> str | None:
    if not isinstance(raw, str):
        return None
    addr = raw.strip()
    if not addr.startswith("0x") or len(addr) != 42:
        return None
    return addr


def normalize_strapi_market(row: dict[str, Any]) -> dict[str, Any] | None:
    """Return a grid/trade-ready dict, or None if chain fields are missing."""
    document_id = row.get("documentId")
    if not isinstance(document_id, str) or not document_id.strip():
        return None

    cpmm_market_id = _positive_int(row.get("cpmm_market_id"))
    trading_address = _valid_address(row.get("cpmm_address")) or _valid_address(row.get("pool_address"))
    market_id = _positive_int(row.get("id"))
    if cpmm_market_id is None or trading_address is None or market_id is None:
        return None

    title = row.get("title") or row.get("question")
    if not isinstance(title, str) or not title.strip():
        return None

    pool_address = _valid_address(row.get("pool_address")) or trading_address
    contract_version = row.get("contract_version") or row.get("contractVersion") or "V4"
    if isinstance(contract_version, str):
        contract_version = contract_version.strip().upper() or "V4"

    return {
        "id": market_id,
        "documentId": document_id.strip(),
        "title": title.strip(),
        "question": (row.get("question") or title).strip()
        if isinstance(row.get("question") or title, str)
        else title.strip(),
        "state": row.get("state") or "PUBLISHED",
        "close_time_utc": row.get("close_time_utc"),
        "cpmm_address": trading_address,
        "cpmm_market_id": str(cpmm_market_id),
        "pool_address": pool_address,
        "contract_version": contract_version,
        "volume": row.get("volume"),
        "current_probability_yes": row.get("current_probability_yes"),
        "current_probability_no": row.get("current_probability_no"),
        "image": row.get("image"),
        "image_url": row.get("image_url"),
        "dry_run": False,
        "is_live": True,
        "source": "strapi",
        "sort_at": row.get("updatedAt") or row.get("publishedAt") or row.get("createdAt"),
    }
