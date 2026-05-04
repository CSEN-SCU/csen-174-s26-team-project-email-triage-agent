"""Integration tests: inbox API reads from Postgres when a DB URL is configured.

Uses SQLAlchemy async + asyncpg. Requires Docker Postgres (docker-compose.yml).
The URL is taken from, in order: ``TEST_DATABASE_URL`` or ``DATABASE_URL`` in the
process environment, or ``database_url`` from ``app.config`` (including values
loaded from ``.env`` — pydantic does not copy those into ``os.environ``).

  docker compose up -d
  python -m unittest tests.test_email_db_integration
"""
from __future__ import annotations

import asyncio
import os
import unittest
from datetime import datetime, timezone

from sqlalchemy import select

from app.config import settings


def _test_database_url() -> str:
    for key in ("TEST_DATABASE_URL", "DATABASE_URL"):
        v = os.environ.get(key, "").strip()
        if v:
            return v
    u = settings.database_url
    return u.strip() if u and u.strip() else ""


_TEST_URL = _test_database_url()


def _run_db_coro(coro):
    """Run async DB work on a loop, then dispose the global engine.

    Each ``asyncio.run()`` creates a new event loop; a cached async SQLAlchemy
    engine must not be reused across runs or asyncpg raises "different loop".
    """

    async def _runner():
        from app.db.session import dispose_async_engine

        try:
            return await coro
        finally:
            await dispose_async_engine()

    return asyncio.run(_runner())


async def _fetch_email_row(email_id: str):
    from app.db.models import EmailRow
    from app.db.session import get_async_session_factory

    factory = get_async_session_factory()
    assert factory is not None
    async with factory() as session:
        result = await session.scalars(
            select(EmailRow).where(EmailRow.id == email_id)
        )
        return result.one()


async def _delete_email_if_exists(email_id: str) -> None:
    from app.db.models import EmailRow
    from app.db.session import get_async_session_factory

    factory = get_async_session_factory()
    assert factory is not None
    async with factory() as session:
        row = await session.get(EmailRow, email_id)
        if row:
            await session.delete(row)
            await session.commit()


async def _insert_synthetic_row(email_id: str) -> None:
    from app.db.models import EmailRow
    from app.db.session import get_async_session_factory

    factory = get_async_session_factory()
    assert factory is not None
    async with factory() as session:
        session.add(
            EmailRow(
                id=email_id,
                thread_id="itest-thread",
                sender_name="Integration Sender",
                sender_email="integration@example.com",
                subject="Only in database — not in MOCK_EMAILS",
                body="This body exists solely to prove the API reads Postgres.",
                received_at=datetime.now(timezone.utc),
                unread=True,
            )
        )
        await session.commit()


@unittest.skipUnless(
    _TEST_URL,
    "Set DATABASE_URL or TEST_DATABASE_URL in .env or the environment, and run Postgres",
)
class EmailPostgresIntegrationTests(unittest.TestCase):
    """GET /api/emails* matches rows read directly from the database (asyncpg)."""

    @classmethod
    def setUpClass(cls) -> None:
        from app.config import set_database_url
        from app.db.seed import init_db_schema_and_seed

        set_database_url(_TEST_URL)

        async def _seed():
            await init_db_schema_and_seed()

        _run_db_coro(_seed())

    def test_get_email_matches_db_row(self) -> None:
        """Opening one email in the API must show the same subject, body,
        and sender as what is stored in Postgres for that id (proves we are not inventing data)."""
        from app.main import app
        from fastapi.testclient import TestClient

        row = _run_db_coro(_fetch_email_row("e1"))
        with TestClient(app) as client:
            response = client.get("/api/emails/e1")
        self.assertEqual(response.status_code, 200, msg=response.text)
        data = response.json()
        self.assertEqual(data["subject"], row.subject)
        self.assertEqual(data["body"], row.body)
        self.assertEqual(data["sender_email"], row.sender_email)

    def test_inserted_row_is_returned_by_api(self) -> None:
        """If an email exists only in the database (not in mock fixtures),
        GET must still return it — otherwise the app is not truly reading from the DB."""
        from app.db.models import EmailRow
        from app.db.session import get_async_session_factory
        from app.main import app
        from fastapi.testclient import TestClient

        email_id = "itest-db-only-row"
        _run_db_coro(_delete_email_if_exists(email_id))
        _run_db_coro(_insert_synthetic_row(email_id))

        try:
            with TestClient(app) as client:
                response = client.get(f"/api/emails/{email_id}")
            self.assertEqual(response.status_code, 200, msg=response.text)
            data = response.json()

            async def _load_row() -> EmailRow:
                factory = get_async_session_factory()
                assert factory is not None
                async with factory() as session:
                    r = await session.get(EmailRow, email_id)
                    assert r is not None
                    return r

            row = _run_db_coro(_load_row())
            self.assertEqual(data["subject"], row.subject)
            self.assertEqual(data["body"], row.body)
        finally:
            _run_db_coro(_delete_email_if_exists(email_id))


if __name__ == "__main__":
    unittest.main()
