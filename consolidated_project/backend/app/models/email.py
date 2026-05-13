from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class Bucket(str, Enum):
    ACT_TODAY = "act_today"
    DECIDE_THIS_WEEK = "decide_this_week"
    FYI = "fyi"


class Intent(str, Enum):
    PROSPECT = "prospect"
    DEAL = "deal"
    CUSTOMER = "customer"
    PARTNERSHIP = "partnership"
    VENDOR = "vendor"
    INTERNAL = "internal"
    COLD_OUTREACH = "cold_outreach"
    OTHER = "other"


class Email(BaseModel):
    id: str
    thread_id: str
    sender_name: str
    sender_email: str
    subject: str
    body: str
    received_at: datetime
    unread: bool = True


class TriageSignal(BaseModel):
    intent: Intent
    priority: int = Field(ge=0, le=100, description="0-100 urgency score")
    bucket: Bucket
    reason: str = Field(description="One-sentence justification grounded in user context")


class ActionItem(BaseModel):
    kind: Literal["reply", "decide", "schedule", "delegate", "archive"]
    label: str
    due_hint: str | None = None


class TriageResult(BaseModel):
    email_id: str
    signal: TriageSignal
    summary: str = Field(description="1-2 sentence summary specific to the user's context")
    actions: list[ActionItem]
    draft_reply: str | None = None


class TriageDigest(BaseModel):
    user_context: str
    generated_at: datetime
    act_today: list[TriageResult]
    decide_this_week: list[TriageResult]
    fyi: list[TriageResult]
