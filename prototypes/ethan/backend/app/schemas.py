from pydantic import BaseModel, ConfigDict, Field


class EmailOut(BaseModel):
    """JSON keys align with `prototypes/ethan/frontend/types/email.ts` (`Email`)."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    subject: str
    sender: str
    sender_email: str = Field(serialization_alias="email")
    body: str
    sent_at: str | None = Field(default=None, serialization_alias="sentAt")
    summary: str
    priority: str
    actions: list[str]
    meetings: list[str]


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    text: str
    due_date: str = Field(serialization_alias="dueDate")
    completed: bool | None = None


class TaskPatch(BaseModel):
    completed: bool


class TriageJson(BaseModel):
    summary: str
    priority: str
    actions: list[str]
    meetings: list[str]
