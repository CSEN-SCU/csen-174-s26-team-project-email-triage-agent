from sqlalchemy import JSON, Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class EmailRow(Base):
    __tablename__ = "emails"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    subject: Mapped[str] = mapped_column(String(512), nullable=False)
    sender: Mapped[str] = mapped_column(String(255), nullable=False)
    sender_email: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    sent_at: Mapped[str | None] = mapped_column(String(128), nullable=True)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[str] = mapped_column(String(16), nullable=False)
    actions: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    meetings: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)

    tasks: Mapped[list["TaskRow"]] = relationship(
        "TaskRow", back_populates="email", cascade="all, delete-orphan"
    )


class TaskRow(Base):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    due_date: Mapped[str] = mapped_column(String(10), nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    email_id: Mapped[str | None] = mapped_column(
        String(64), ForeignKey("emails.id", ondelete="SET NULL"), nullable=True
    )

    email: Mapped["EmailRow | None"] = relationship("EmailRow", back_populates="tasks")
