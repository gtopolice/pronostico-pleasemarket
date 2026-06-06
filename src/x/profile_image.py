"""Upgrade X/Twitter profile image URLs from thumbnail to 400×400."""

from __future__ import annotations

import re

_TWITTER_PROFILE_HOST = "pbs.twimg.com/profile_images/"
_TWITTER_SIZE_SUFFIX = re.compile(r"_(?:normal|mini|bigger)(?=\.(?:jpe?g|png|webp)$)", re.I)


def upsize_twitter_profile_image_url(url: str | None) -> str | None:
    if not url:
        return url
    trimmed = url.strip()
    if _TWITTER_PROFILE_HOST not in trimmed:
        return trimmed
    return _TWITTER_SIZE_SUFFIX.sub("_400x400", trimmed)
