import asyncio
import json
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.agent.graph import triage_email
from app.data.mock_inbox import DEFAULT_USER_CONTEXT, MOCK_EMAILS
from app.models.email import Bucket, Email, TriageDigest, TriageResult

router = APIRouter()


class ContextPayload(BaseModel):
    user_context: str


class TriagePayload(BaseModel):
    user_context: str | None = None
    email_ids: list[str] | None = None


_user_context: str = DEFAULT_USER_CONTEXT


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/emails", response_model=list[Email])
def list_emails() -> list[Email]:
    return sorted(MOCK_EMAILS, key=lambda e: e.received_at, reverse=True)


@router.get("/emails/{email_id}", response_model=Email)
def get_email(email_id: str) -> Email:
    for email in MOCK_EMAILS:
        if email.id == email_id:
            return email
    raise HTTPException(status_code=404, detail="email not found")


@router.get("/context")
def get_context() -> dict[str, str]:
    return {"user_context": _user_context}


@router.post("/context")
def set_context(payload: ContextPayload) -> dict[str, str]:
    global _user_context
    _user_context = payload.user_context.strip() or DEFAULT_USER_CONTEXT
    return {"user_context": _user_context}


def _select_emails(ids: list[str] | None) -> list[Email]:
    if not ids:
        return list(MOCK_EMAILS)
    by_id = {e.id: e for e in MOCK_EMAILS}
    missing = [i for i in ids if i not in by_id]
    if missing:
        raise HTTPException(status_code=404, detail=f"unknown email ids: {missing}")
    return [by_id[i] for i in ids]


def _bucket_results(results: list[TriageResult]) -> TriageDigest:
    buckets = {Bucket.ACT_TODAY: [], Bucket.DECIDE_THIS_WEEK: [], Bucket.FYI: []}
    for r in results:
        buckets[r.signal.bucket].append(r)
    for items in buckets.values():
        items.sort(key=lambda r: r.signal.priority, reverse=True)
    return TriageDigest(
        user_context=_user_context,
        generated_at=datetime.now(timezone.utc),
        act_today=buckets[Bucket.ACT_TODAY],
        decide_this_week=buckets[Bucket.DECIDE_THIS_WEEK],
        fyi=buckets[Bucket.FYI],
    )


@router.post("/triage", response_model=TriageDigest)
async def triage(payload: TriagePayload) -> TriageDigest:
    global _user_context
    if payload.user_context:
        _user_context = payload.user_context
    emails = _select_emails(payload.email_ids)
    loop = asyncio.get_running_loop()
    with ThreadPoolExecutor(max_workers=min(8, len(emails) or 1)) as pool:
        results = await asyncio.gather(
            *(
                loop.run_in_executor(pool, triage_email, email, _user_context)
                for email in emails
            )
        )
    return _bucket_results(list(results))


@router.post("/triage/stream")
async def triage_stream(payload: TriagePayload):
    """Server-sent events: emit one JSON line per email as it resolves."""
    global _user_context
    if payload.user_context:
        _user_context = payload.user_context
    emails = _select_emails(payload.email_ids)
    context = _user_context

    async def event_source():
        loop = asyncio.get_running_loop()
        with ThreadPoolExecutor(max_workers=min(8, len(emails) or 1)) as pool:
            tasks = [
                loop.run_in_executor(pool, triage_email, email, context)
                for email in emails
            ]
            yield f"event: start\ndata: {json.dumps({'total': len(emails)})}\n\n"
            for coro in asyncio.as_completed(tasks):
                result = await coro
                yield f"event: email\ndata: {result.model_dump_json()}\n\n"
            yield "event: done\ndata: {}\n\n"

    return StreamingResponse(event_source(), media_type="text/event-stream")
