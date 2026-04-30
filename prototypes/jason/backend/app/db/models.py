from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class EmailRow(Base):
    __tablename__ = "emails"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    thread_id: Mapped[str] = mapped_column(String(64), index=True)
    sender_name: Mapped[str] = mapped_column(String(512))
    sender_email: Mapped[str] = mapped_column(String(512))
    subject: Mapped[str] = mapped_column(String(1024))
    body: Mapped[str] = mapped_column(Text())
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    unread: Mapped[bool] = mapped_column(Boolean(), default=True)
