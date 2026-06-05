"""Postgres connection pool for Chiwiwis agent."""

from __future__ import annotations

import logging
from contextlib import contextmanager
from typing import Any, Iterator

from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from src.config import settings

logger = logging.getLogger(__name__)

_pool: ConnectionPool | None = None


def get_pool() -> ConnectionPool:
    global _pool
    if _pool is None:
        _pool = ConnectionPool(
            conninfo=settings.database_url,
            min_size=1,
            max_size=5,
            kwargs={"row_factory": dict_row},
        )
    return _pool


def init_db() -> None:
    pool = get_pool()
    with pool.connection() as conn:
        with conn.cursor() as cur:
            with open(__file__.replace("pool.py", "schema.sql"), encoding="utf-8") as f:
                cur.execute(f.read())
        conn.commit()
    logger.info("Chiwiwis DB schema initialized")


@contextmanager
def db_conn() -> Iterator[Any]:
    with get_pool().connection() as conn:
        yield conn
