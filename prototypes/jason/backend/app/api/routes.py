import asyncio
import json
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.agent.graph import get_graph, triage_email
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


# Maps internal LangGraph node names to stable, UI-friendly stage labels.
_STAGE_LABELS = {
    "classify_node": "classify",
    "summarize_node": "summarize",
    "actions_node": "actions",
    "draft_node": "draft",
    "skip_draft_node": "draft",
}


def _serialize_patch(patch: dict[str, Any]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in patch.items():
        if hasattr(value, "model_dump"):
            out[key] = value.model_dump(mode="json")
        elif isinstance(value, list):
            out[key] = [
                v.model_dump(mode="json") if hasattr(v, "model_dump") else v
                for v in value
            ]
        else:
            out[key] = value
    return out


@router.post("/triage/stream")
async def triage_stream(payload: TriagePayload):
    """SSE: emit per-stage updates as each LangGraph node completes per email.

    Events:
      - start      {total}
      - stage      {email_id, stage, patch}   # stage ∈ classify|summarize|actions|draft
      - email_done {email_id}
      - error      {email_id, message}
      - done       {}
    """
    global _user_context
    if payload.user_context:
        _user_context = payload.user_context
    emails = _select_emails(payload.email_ids)
    context = _user_context

    async def event_source():
        loop = asyncio.get_running_loop()
        queue: asyncio.Queue[tuple[str, dict[str, Any]]] = asyncio.Queue()
        graph = get_graph()

        def put(event: str, data: dict[str, Any]) -> None:
            loop.call_soon_threadsafe(queue.put_nowait, (event, data))

        def run_one(email: Email) -> None:
            try:
                for update in graph.stream(
                    {"email": email, "user_context": context},
                    stream_mode="updates",
                ):
                    for node, patch in update.items():
                        stage = _STAGE_LABELS.get(node, node)
                        put(
                            "stage",
                            {
                                "email_id": email.id,
                                "stage": stage,
                                "patch": _serialize_patch(patch or {}),
                            },
                        )
                put("email_done", {"email_id": email.id})
            except Exception as exc:  # noqa: BLE001 — surface to client
                put("error", {"email_id": email.id, "message": str(exc)})

        pool = ThreadPoolExecutor(max_workers=min(8, len(emails) or 1))
        try:
            for email in emails:
                loop.run_in_executor(pool, run_one, email)

            yield f"event: start\ndata: {json.dumps({'total': len(emails)})}\n\n"

            remaining = len(emails)
            while remaining > 0:
                event, data = await queue.get()
                yield f"event: {event}\ndata: {json.dumps(data)}\n\n"
                if event in ("email_done", "error"):
                    remaining -= 1

            yield "event: done\ndata: {}\n\n"
        finally:
            pool.shutdown(wait=False)

    return StreamingResponse(event_source(), media_type="text/event-stream")
