import asyncio
import hashlib
import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.agent.orchestrator import triage_email
from app.auth.deps import gmail_access_token
from app.auth.gmail import (
    GmailFetchError,
    create_draft_reply,
    fetch_emails_by_ids,
    fetch_inbox,
    send_reply,
)
from app.data.mock_inbox import DEFAULT_USER_CONTEXT
from app.inbox_repository import (
    UnknownEmailIdsError,
    all_emails_default_order,
    get_email,
    get_emails_by_ids,
    list_emails as list_emails_repo,
)
from app.models.email import Bucket, Email, SendReplyPayload, TriageDigest, TriageResult
from app.security import rate_limit_default, rate_limit_triage, sanitize_user_context

router = APIRouter()
logger = logging.getLogger("triage.routes")


class ContextPayload(BaseModel):
    user_context: str


class TriagePayload(BaseModel):
    user_context: str | None = None
    email_ids: list[str] | None = None


_user_context: str = DEFAULT_USER_CONTEXT
_triage_cache: dict[tuple[str, str], TriageResult] = {}


def _cache_key(email_id: str, token: str | None) -> tuple[str, str]:
    owner = "preview" if token is None else hashlib.sha256(token.encode()).hexdigest()
    return (owner, email_id)


def _set_user_context(raw_context: str) -> None:
    global _user_context
    next_context = sanitize_user_context(raw_context) or DEFAULT_USER_CONTEXT
    if next_context != _user_context:
        _triage_cache.clear()
    _user_context = next_context


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/auth/status")
def auth_status(
    token: str | None = Depends(gmail_access_token),
    _: str = Depends(rate_limit_default),
) -> dict[str, bool]:
    """Cheap probe used by the frontend to verify the Bearer token reached the
    backend (i.e. the NextAuth proxy is wired and the user is signed in)."""
    return {"authenticated": token is not None}


@router.get("/emails", response_model=list[Email])
async def list_emails(
    token: str | None = Depends(gmail_access_token),
    _: str = Depends(rate_limit_default),
) -> list[Email]:
    if token:
        try:
            return await fetch_inbox(token)
        except GmailFetchError as exc:
            logger.warning("gmail fetch failed; serving mock inbox: %s", exc)
    try:
        return await list_emails_repo()
    except Exception as exc:  # noqa: BLE001 — surface DB outage as 503
        logger.exception("inbox repository unavailable")
        raise HTTPException(
            status_code=503,
            detail="email backend unavailable",
        ) from exc


@router.get("/emails/{email_id}", response_model=Email)
async def get_email_by_id(
    email_id: str,
    token: str | None = Depends(gmail_access_token),
    _: str = Depends(rate_limit_default),
) -> Email:
    if token:
        try:
            emails = await fetch_emails_by_ids(token, [email_id])
            if emails:
                return emails[0]
        except GmailFetchError as exc:
            logger.warning("gmail get failed; falling back to mock: %s", exc)
    try:
        email = await get_email(email_id)
    except Exception as exc:  # noqa: BLE001 — surface DB outage as 503
        logger.exception("inbox repository unavailable")
        raise HTTPException(
            status_code=503,
            detail="email backend unavailable",
        ) from exc
    if email is None:
        raise HTTPException(status_code=404, detail="email not found")
    return email


@router.get("/context")
def get_context(_: str = Depends(rate_limit_default)) -> dict[str, str]:
    return {"user_context": _user_context}


@router.post("/context")
def set_context(
    payload: ContextPayload,
    _: str = Depends(rate_limit_triage),
) -> dict[str, str]:
    _set_user_context(payload.user_context)
    return {"user_context": _user_context}


async def _select_emails(
    ids: list[str] | None,
    token: str | None,
) -> list[Email]:
    if token:
        try:
            inbox = await fetch_inbox(token)
        except GmailFetchError as exc:
            raise HTTPException(status_code=502, detail=f"gmail fetch failed: {exc}") from exc
        if not ids:
            return inbox
        by_id = {e.id: e for e in inbox}
        missing = [i for i in ids if i not in by_id]
        if missing:
            try:
                extras = await fetch_emails_by_ids(token, missing)
            except GmailFetchError as exc:
                raise HTTPException(
                    status_code=404,
                    detail=f"unknown gmail message ids: {missing}",
                ) from exc
            for e in extras:
                by_id[e.id] = e
        return [by_id[i] for i in ids if i in by_id]

    try:
        if not ids:
            return await all_emails_default_order()
        return await get_emails_by_ids(ids)
    except UnknownEmailIdsError as exc:
        raise HTTPException(
            status_code=404,
            detail=f"unknown email ids: {exc.missing}",
        ) from exc
    except Exception as exc:  # noqa: BLE001 — DB / repo outage
        logger.exception("inbox repository unavailable")
        raise HTTPException(
            status_code=503,
            detail="email backend unavailable",
        ) from exc


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
async def triage(
    payload: TriagePayload,
    token: str | None = Depends(gmail_access_token),
    _: str = Depends(rate_limit_triage),
) -> TriageDigest:
    if payload.user_context:
        _set_user_context(payload.user_context)
    emails = await _select_emails(payload.email_ids, token)
    semaphore = asyncio.Semaphore(4)  # cap concurrent Node subprocesses

    async def _one(email: Email) -> TriageResult:
        key = _cache_key(email.id, token)
        if cached := _triage_cache.get(key):
            return cached
        async with semaphore:
            result = await triage_email(email, _user_context, token)
            _triage_cache[key] = result
            return result

    try:
        results = await asyncio.gather(*(_one(e) for e in emails))
    except Exception as exc:  # noqa: BLE001 — LLM / agent outage
        logger.exception("triage agent failed")
        raise HTTPException(status_code=502, detail="triage agent unavailable") from exc
    return _bucket_results(list(results))


@router.post("/triage/stream")
async def triage_stream(
    payload: TriagePayload,
    token: str | None = Depends(gmail_access_token),
    _: str = Depends(rate_limit_triage),
):
    """SSE: emit one 'result' event per email plus start/done.

    Events:
      - start       {total}
      - result      {email_id, result}     # full TriageResult JSON
      - error       {email_id, message}
      - done        {}
    """
    if payload.user_context:
        _set_user_context(payload.user_context)
    emails = await _select_emails(payload.email_ids, token)
    context_blurb = _user_context

    async def event_source():
        yield f"event: start\ndata: {json.dumps({'total': len(emails)})}\n\n"
        semaphore = asyncio.Semaphore(4)
        uncached_emails: list[Email] = []

        for email in emails:
            cached = _triage_cache.get(_cache_key(email.id, token))
            if cached:
                yield (
                    "event: result\n"
                    f"data: {json.dumps({'email_id': email.id, 'result': cached.model_dump(mode='json')})}\n\n"
                )
            else:
                uncached_emails.append(email)

        async def _one(email: Email):
            async with semaphore:
                try:
                    result = await triage_email(email, context_blurb, token)
                    _triage_cache[_cache_key(email.id, token)] = result
                    return ("result", {"email_id": email.id, "result": result.model_dump(mode="json")})
                except Exception as exc:  # noqa: BLE001 — surface to client
                    return ("error", {"email_id": email.id, "message": str(exc)})

        for coro in asyncio.as_completed([_one(e) for e in uncached_emails]):
            event, data = await coro
            yield f"event: {event}\ndata: {json.dumps(data)}\n\n"
        yield "event: done\ndata: {}\n\n"

    return StreamingResponse(event_source(), media_type="text/event-stream")


@router.post("/send")
async def send_reply_endpoint(
    payload: SendReplyPayload,
    token: str | None = Depends(gmail_access_token),
    _: str = Depends(rate_limit_triage),
) -> dict[str, str]:
    if not token:
        raise HTTPException(status_code=401, detail="gmail authentication required")
    try:
        result = await send_reply(token, payload.email_id, payload.body)
    except GmailFetchError as exc:
        logger.warning("gmail send failed: %s", exc)
        raise HTTPException(status_code=502, detail=f"gmail send failed: {exc}") from exc
    return {**result, "status": "sent"}


@router.post("/draft")
async def save_draft_endpoint(
    payload: SendReplyPayload,
    token: str | None = Depends(gmail_access_token),
    _: str = Depends(rate_limit_triage),
) -> dict[str, str]:
    if not token:
        raise HTTPException(status_code=401, detail="gmail authentication required")
    try:
        result = await create_draft_reply(token, payload.email_id, payload.body)
    except GmailFetchError as exc:
        logger.warning("gmail draft create failed: %s", exc)
        raise HTTPException(
            status_code=502, detail=f"gmail draft create failed: {exc}"
        ) from exc
    return {**result, "status": "draft_saved"}
