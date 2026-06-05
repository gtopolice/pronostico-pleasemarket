"""Structured LLM output for market intent parsing."""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class MarketIntent(BaseModel):
    question: str = Field(..., min_length=10, max_length=280)
    title: str = Field(..., min_length=5, max_length=120)
    resolution_rules: str = Field(..., min_length=20)
    close_time: datetime
    confidence: float = Field(..., ge=0.0, le=1.0)
    reject: bool = False
    reject_reason: str | None = None
    locale: Literal["es", "en", "pt"] = "en"


class TweetContext(BaseModel):
    tweet_id: str
    author_id: str
    author_handle: str | None = None
    text: str
    parent_text: str | None = None
    quoted_text: str | None = None
    tweet_url: str
