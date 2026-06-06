"""Detect tweet locale for replies and market URLs."""

from __future__ import annotations

import re

_SPANISH_MARKERS = re.compile(
    r"[¿¡]|(?:\b(ser[aá]|antes|volumen|mercado|predicci[oó]n|alcanzar|superar|agotar|anunciar)\b)",
    re.I,
)


def detect_locale(text: str) -> str:
    if _SPANISH_MARKERS.search(text):
        return "es"
    return "en"
