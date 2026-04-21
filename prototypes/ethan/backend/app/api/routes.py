from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import EmailRow, TaskRow
from app.schemas import EmailOut, TaskOut, TaskPatch
from app.services.openai_triage import triage_with_openai

router = APIRouter()


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/emails", response_model=list[EmailOut])
def list_emails(db: Session = Depends(get_db)) -> list[EmailRow]:
    rows = db.scalars(select(EmailRow).order_by(EmailRow.id)).all()
    return list(rows)


@router.get("/emails/{email_id}", response_model=EmailOut)
def get_email(email_id: str, db: Session = Depends(get_db)) -> EmailRow:
    row = db.get(EmailRow, email_id)
    if not row:
        raise HTTPException(status_code=404, detail="email not found")
    return row


@router.post("/emails/{email_id}/analyze", response_model=EmailOut)
def analyze_email(email_id: str, db: Session = Depends(get_db)) -> EmailRow:
    row = db.get(EmailRow, email_id)
    if not row:
        raise HTTPException(status_code=404, detail="email not found")
    try:
        triage = triage_with_openai(
            subject=row.subject,
            sender=row.sender,
            sender_email=row.sender_email,
            body=row.body,
        )
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"OpenAI request failed: {e!s}",
        ) from e

    row.summary = triage.summary
    row.priority = triage.priority
    row.actions = triage.actions
    row.meetings = triage.meetings
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/tasks", response_model=list[TaskOut])
def list_tasks(db: Session = Depends(get_db)) -> list[TaskRow]:
    rows = db.scalars(select(TaskRow).order_by(TaskRow.due_date, TaskRow.id)).all()
    return list(rows)


@router.patch("/tasks/{task_id}", response_model=TaskOut)
def patch_task(
    task_id: str, payload: TaskPatch, db: Session = Depends(get_db)
) -> TaskRow:
    row = db.get(TaskRow, task_id)
    if not row:
        raise HTTPException(status_code=404, detail="task not found")
    row.completed = payload.completed
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/insights/weekly", response_model=list[str])
def weekly_insights(db: Session = Depends(get_db)) -> list[str]:
    n_high = (
        db.scalar(
            select(func.count()).select_from(EmailRow).where(EmailRow.priority == "High")
        )
        or 0
    )
    n_med = (
        db.scalar(
            select(func.count()).select_from(EmailRow).where(EmailRow.priority == "Medium")
        )
        or 0
    )
    n_low = (
        db.scalar(
            select(func.count()).select_from(EmailRow).where(EmailRow.priority == "Low")
        )
        or 0
    )
    open_tasks = (
        db.scalar(
            select(func.count()).select_from(TaskRow).where(TaskRow.completed.is_(False))
        )
        or 0
    )
    done_tasks = (
        db.scalar(
            select(func.count()).select_from(TaskRow).where(TaskRow.completed.is_(True))
        )
        or 0
    )
    return [
        f"{n_high} high-priority emails in the database snapshot",
        f"{n_med} medium and {n_low} low-priority emails",
        f"{open_tasks} open tasks ({done_tasks} completed)",
    ]
