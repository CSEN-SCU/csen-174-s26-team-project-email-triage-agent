from sqlalchemy import select

from app.data.mock_inbox import MOCK_EMAILS
from app.db.models import EmailRow
from app.db.session import get_async_session_factory
from app.models.email import Email


class UnknownEmailIdsError(Exception):
    def __init__(self, missing: list[str]) -> None:
        self.missing = missing
        super().__init__(missing)


def _to_email(row: EmailRow) -> Email:
    return Email(
        id=row.id,
        thread_id=row.thread_id,
        sender_name=row.sender_name,
        sender_email=row.sender_email,
        subject=row.subject,
        body=row.body,
        received_at=row.received_at,
        unread=row.unread,
    )


async def list_emails() -> list[Email]:
    factory = get_async_session_factory()
    if factory is None:
        return sorted(MOCK_EMAILS, key=lambda e: e.received_at, reverse=True)
    async with factory() as session:
        result = await session.scalars(
            select(EmailRow).order_by(EmailRow.received_at.desc())
        )
        rows = result.all()
        return [_to_email(r) for r in rows]


async def all_emails_default_order() -> list[Email]:
    """Same ordering as the original in-memory inbox (fixture order / id order)."""
    factory = get_async_session_factory()
    if factory is None:
        return list(MOCK_EMAILS)
    async with factory() as session:
        result = await session.scalars(select(EmailRow).order_by(EmailRow.id))
        rows = result.all()
        return [_to_email(r) for r in rows]


async def get_email(email_id: str) -> Email | None:
    factory = get_async_session_factory()
    if factory is None:
        for email in MOCK_EMAILS:
            if email.id == email_id:
                return email
        return None
    async with factory() as session:
        row = await session.get(EmailRow, email_id)
        return _to_email(row) if row else None


async def get_emails_by_ids(ids: list[str]) -> list[Email]:
    factory = get_async_session_factory()
    if factory is None:
        by_id = {e.id: e for e in MOCK_EMAILS}
        missing = [i for i in ids if i not in by_id]
        if missing:
            raise UnknownEmailIdsError(missing)
        return [by_id[i] for i in ids]
    async with factory() as session:
        result = await session.scalars(
            select(EmailRow).where(EmailRow.id.in_(ids))
        )
        rows = result.all()
        by_id = {r.id: r for r in rows}
        missing = [i for i in ids if i not in by_id]
        if missing:
            raise UnknownEmailIdsError(missing)
        return [_to_email(by_id[i]) for i in ids]
