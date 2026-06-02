"""Postgres-backed cache for voice and relationship profiles.

Reads return ``None`` on a miss OR when the cached row is older than ``ttl_days``
(callers then recompute). All functions degrade to a no-op/``None`` when no
database is configured, so triage never hard-fails on a cache outage.
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from app.db.models import RelationshipProfileRow, VoiceProfileRow
from app.db.session import get_async_session_factory

logger = logging.getLogger("triage.profiles")


def _fresh(updated_at: datetime, ttl_days: int) -> bool:
    if updated_at.tzinfo is None:
        updated_at = updated_at.replace(tzinfo=timezone.utc)
    return updated_at >= datetime.now(timezone.utc) - timedelta(days=ttl_days)


async def read_voice_profile(user_email: str, ttl_days: int = 7) -> dict | None:
    factory = get_async_session_factory()
    if factory is None:
        return None
    async with factory() as s:
        row = await s.get(VoiceProfileRow, user_email)
        if row is None or not _fresh(row.updated_at, ttl_days):
            return None
        return row.profile_json


async def write_voice_profile(user_email: str, profile: dict) -> None:
    factory = get_async_session_factory()
    if factory is None:
        logger.warning("no DB; skipping voice profile persist for %s", user_email)
        return
    async with factory() as s:
        row = await s.get(VoiceProfileRow, user_email)
        now = datetime.now(timezone.utc)
        if row is None:
            s.add(VoiceProfileRow(user_email=user_email, profile_json=profile, updated_at=now))
        else:
            row.profile_json = profile
            row.updated_at = now
        await s.commit()


async def read_relationship_profile(
    user_email: str, sender_email: str, ttl_days: int = 1
) -> dict | None:
    factory = get_async_session_factory()
    if factory is None:
        return None
    async with factory() as s:
        row = await s.get(RelationshipProfileRow, (user_email, sender_email))
        if row is None or not _fresh(row.updated_at, ttl_days):
            return None
        return row.profile_json


async def write_relationship_profile(
    user_email: str, sender_email: str, profile: dict
) -> None:
    factory = get_async_session_factory()
    if factory is None:
        logger.warning("no DB; skipping relationship persist for %s/%s", user_email, sender_email)
        return
    async with factory() as s:
        row = await s.get(RelationshipProfileRow, (user_email, sender_email))
        now = datetime.now(timezone.utc)
        if row is None:
            s.add(RelationshipProfileRow(
                user_email=user_email, sender_email=sender_email,
                profile_json=profile, updated_at=now,
            ))
        else:
            row.profile_json = profile
            row.updated_at = now
        await s.commit()
