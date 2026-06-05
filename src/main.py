"""Chiwiwis agent entrypoint."""

from __future__ import annotations

import logging
import os
import sys

import uvicorn

from src.config import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    stream=sys.stdout,
)


def main() -> None:
    port = int(os.environ.get("PORT", settings.port))
    uvicorn.run(
        "src.api.app:app",
        host=settings.host,
        port=port,
        log_level="info",
    )


if __name__ == "__main__":
    main()
