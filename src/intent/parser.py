"""LLM pipeline: tweet context → binary market payload."""

from __future__ import annotations

import json
import logging
import re
from datetime import datetime, timedelta, timezone

from openai import OpenAI

from src.config import settings
from src.intent.models import MarketIntent, TweetContext

logger = logging.getLogger(__name__)

_MENTION_RE = re.compile(r"@(\w+)", re.I)
_BOT_HANDLES = frozenset(
    {
        "pleasemarketbot",
        "pleasemarket",
        "chiwiwis",
        "please.market",
    }
)


def _bot_handles() -> frozenset[str]:
    handle = settings.please_x_handle.lower().lstrip("@")
    return _BOT_HANDLES | {handle}


def _normalize_ws(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _strip_bot_mentions(text: str) -> str:
    """Remove only Please.market bot @mentions; keep subject handles like @anyone_market."""

    bot_handles = _bot_handles()

    def repl(match: re.Match[str]) -> str:
        if match.group(1).lower() in bot_handles:
            return ""
        return match.group(0)

    return _normalize_ws(_MENTION_RE.sub(repl, text))


def _fallback_intent(ctx: TweetContext) -> MarketIntent:
    prompt = _strip_bot_mentions(ctx.text)
    if ctx.parent_text:
        prompt = f"{prompt} (context: {_strip_bot_mentions(ctx.parent_text)[:200]})"
    close = datetime.now(timezone.utc) + timedelta(days=7)
    return MarketIntent(
        question=prompt[:280] or "Will this event happen?",
        title=(prompt[:117] + "...") if len(prompt) > 120 else prompt[:120] or "Please.market market",
        resolution_rules=(
            "Resolves YES if the stated condition in the question occurs before close time. "
            "Otherwise NO. Creator resolves using published rules and credible public sources."
        ),
        close_time=close,
        confidence=0.5,
        locale="en",
    )


async def parse_market_intent(ctx: TweetContext) -> MarketIntent:
    """Parse tweet + context into a structured binary market using OpenAI structured output."""

    if not settings.openai_api_key:
        logger.warning("OPENAI_API_KEY missing — using fallback parser")
        return _fallback_intent(ctx)

    client = OpenAI(api_key=settings.openai_api_key)
    system = (
        "You are Please.market, Anyone's X prediction-market agent. "
        "Convert user prompts into binary prediction markets. "
        "Preserve @username mentions when they are part of the prediction subject "
        "(e.g. 'Will @someone reach X by date?'). Do not remove those handles from question or title. "
        "Output JSON only. Set reject=true for illegal content, spam, or unparseable prompts. "
        "close_time must be ISO8601 UTC, at least 24h and at most 90 days from now."
    )
    user_parts = [
        f"User tweet: {ctx.text}",
        f"Tweet URL: {ctx.tweet_url}",
    ]
    if ctx.parent_text:
        user_parts.append(f"Parent tweet: {ctx.parent_text}")
    if ctx.quoted_text:
        user_parts.append(f"Quoted tweet: {ctx.quoted_text}")

    try:
        response = client.chat.completions.create(
            model=settings.please_llm_model,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system},
                {
                    "role": "user",
                    "content": "\n".join(user_parts)
                    + '\n\nReturn JSON: {"question","title","resolution_rules","close_time","confidence","reject","reject_reason","locale"}',
                },
            ],
            temperature=0.2,
        )
        raw = response.choices[0].message.content or "{}"
        data = json.loads(raw)
        if data.get("reject"):
            return MarketIntent(
                question="rejected",
                title="rejected",
                resolution_rules="rejected",
                close_time=datetime.now(timezone.utc) + timedelta(days=1),
                confidence=0.0,
                reject=True,
                reject_reason=data.get("reject_reason") or "Could not parse a valid market.",
            )
        close_raw = data.get("close_time")
        close_dt = datetime.fromisoformat(str(close_raw).replace("Z", "+00:00"))
        if close_dt.tzinfo is None:
            close_dt = close_dt.replace(tzinfo=timezone.utc)
        return MarketIntent(
            question=_normalize_ws(str(data["question"])),
            title=_normalize_ws(str(data.get("title") or data["question"]))[:120],
            resolution_rules=str(data["resolution_rules"]),
            close_time=close_dt,
            confidence=float(data.get("confidence", 0.8)),
            locale=data.get("locale", "en"),
        )
    except Exception as exc:
        logger.exception("LLM parse failed: %s", exc)
        intent = _fallback_intent(ctx)
        intent.confidence = 0.4
        return intent
