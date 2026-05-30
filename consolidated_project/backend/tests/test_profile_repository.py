import pytest
import pytest_asyncio
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine, AsyncSession

from app.db.base import Base
from app.db import models  # noqa: F401 — register tables
import app.profile_repository as repo


@pytest_asyncio.fixture
async def session_factory(monkeypatch):
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    monkeypatch.setattr(repo, "get_async_session_factory", lambda: factory)
    yield factory
    await engine.dispose()


@pytest.mark.asyncio
async def test_voice_profile_round_trip(session_factory):
    await repo.write_voice_profile("seller@x.com", {"tone": "warm"})
    got = await repo.read_voice_profile("seller@x.com", ttl_days=7)
    assert got == {"tone": "warm"}


@pytest.mark.asyncio
async def test_voice_profile_stale_returns_none(session_factory, monkeypatch):
    await repo.write_voice_profile("seller@x.com", {"tone": "warm"})
    async with session_factory() as s:
        row = await s.get(models.VoiceProfileRow, "seller@x.com")
        row.updated_at = datetime.now(timezone.utc) - timedelta(days=30)
        await s.commit()
    assert await repo.read_voice_profile("seller@x.com", ttl_days=7) is None


@pytest.mark.asyncio
async def test_relationship_profile_round_trip(session_factory):
    await repo.write_relationship_profile("seller@x.com", "buyer@acme.com", {"familiarity": "high"})
    got = await repo.read_relationship_profile("seller@x.com", "buyer@acme.com", ttl_days=1)
    assert got == {"familiarity": "high"}
