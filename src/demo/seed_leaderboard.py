"""Static leaderboard rows for hackathon demo when org API is empty."""

from __future__ import annotations

from typing import Any

SEED_CREATOR_LEADERBOARD: list[dict[str, Any]] = [
    {
        "twitter_id": "seed-creator-ballknower",
        "twitter_handle": "ballknower",
        "volume_usdc": 18_420,
        "trade_count": 1_204,
        "market_count": 6,
    },
    {
        "twitter_id": "seed-creator-oracle",
        "twitter_handle": "oracle",
        "volume_usdc": 14_880,
        "trade_count": 986,
        "market_count": 5,
    },
    {
        "twitter_id": "seed-creator-wallstbets",
        "twitter_handle": "wallstbets",
        "volume_usdc": 11_350,
        "trade_count": 742,
        "market_count": 4,
    },
    {
        "twitter_id": "seed-creator-degenqueen",
        "twitter_handle": "degenqueen",
        "volume_usdc": 9_640,
        "trade_count": 618,
        "market_count": 3,
    },
    {
        "twitter_id": "seed-creator-goldbug",
        "twitter_handle": "goldbug",
        "volume_usdc": 7_210,
        "trade_count": 455,
        "market_count": 3,
    },
    {
        "twitter_id": "seed-creator-eminence",
        "twitter_handle": "eminence",
        "volume_usdc": 5_980,
        "trade_count": 392,
        "market_count": 2,
    },
    {
        "twitter_id": "seed-creator-satoshi",
        "twitter_handle": "satoshi",
        "volume_usdc": 4_320,
        "trade_count": 287,
        "market_count": 2,
    },
    {
        "twitter_id": "seed-creator-popcorn",
        "twitter_handle": "popcorn",
        "volume_usdc": 2_860,
        "trade_count": 164,
        "market_count": 1,
    },
]

SEED_AMBASSADOR_LEADERBOARD: list[dict[str, Any]] = [
    {
        "twitter_id": "seed-ambassador-anyone",
        "twitter_handle": "anyone",
        "referral_volume_usdc": 12_400,
        "referral_count": 148,
        "earned_usdc": 1_240,
    },
    {
        "twitter_id": "seed-ambassador-degenqueen",
        "twitter_handle": "degenqueen",
        "referral_volume_usdc": 9_850,
        "referral_count": 112,
        "earned_usdc": 985,
    },
    {
        "twitter_id": "seed-ambassador-oracle",
        "twitter_handle": "oracle",
        "referral_volume_usdc": 7_620,
        "referral_count": 89,
        "earned_usdc": 762,
    },
    {
        "twitter_id": "seed-ambassador-ballknower",
        "twitter_handle": "ballknower",
        "referral_volume_usdc": 5_940,
        "referral_count": 71,
        "earned_usdc": 594,
    },
    {
        "twitter_id": "seed-ambassador-wallstbets",
        "twitter_handle": "wallstbets",
        "referral_volume_usdc": 4_180,
        "referral_count": 52,
        "earned_usdc": 418,
    },
    {
        "twitter_id": "seed-ambassador-goldbug",
        "twitter_handle": "goldbug",
        "referral_volume_usdc": 2_760,
        "referral_count": 34,
        "earned_usdc": 276,
    },
]


def seed_leaderboard(role: str = "creator") -> list[dict[str, Any]]:
    if role == "ambassador":
        return [dict(row) for row in SEED_AMBASSADOR_LEADERBOARD]
    return [dict(row) for row in SEED_CREATOR_LEADERBOARD]


def merge_leaderboard(live: list[dict[str, Any]], *, role: str = "creator") -> list[dict[str, Any]]:
    """Prefer live API rows; fill with demo seed when empty or sparse."""

    seed = seed_leaderboard(role)
    if not live:
        return seed

    seen = {str(row.get("twitter_id") or row.get("twitter_handle") or "").lower() for row in live}
    merged = [dict(row) for row in live]
    for row in seed:
        key = str(row.get("twitter_id") or row.get("twitter_handle") or "").lower()
        if key and key not in seen:
            merged.append(dict(row))
            seen.add(key)

    if role == "ambassador":
        merged.sort(key=lambda r: int(r.get("referral_volume_usdc") or 0), reverse=True)
    else:
        merged.sort(key=lambda r: int(r.get("volume_usdc") or 0), reverse=True)
    return merged
