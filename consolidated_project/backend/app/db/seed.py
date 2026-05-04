from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.data.mock_inbox import MOCK_EMAILS
from app.db.base import Base
from app.db.models import EmailRow
from app.db.session import get_async_engine, get_async_session_factory


def _row_from_fixture(e) -> EmailRow:
    return EmailRow(
        id=e.id,
        thread_id=e.thread_id,
        sender_name=e.sender_name,
        sender_email=e.sender_email,
        subject=e.subject,
        body=e.body,
        received_at=e.received_at,
        unread=e.unread,
    )


async def seed_if_empty(session: AsyncSession) -> None:
    count = await session.scalar(select(func.count()).select_from(EmailRow))
    if count and count > 0:
        return
    for e in MOCK_EMAILS:
        session.add(_row_from_fixture(e))
    await session.commit()


async def init_db_schema_and_seed() -> None:
    engine = get_async_engine()
    if engine is None:
        return
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = get_async_session_factory()
    if factory is None:
        return
    async with factory() as session:
        await seed_if_empty(session)
