"""Gmail client. Reads a user's recent inbox using an OAuth access token
forwarded from the Next.js NextAuth session.

The frontend (NextAuth) owns the OAuth dance and refresh; this module only
needs a fresh `access_token` per request.
"""

from __future__ import annotations

import asyncio
import base64
import logging
import re
from datetime import datetime, timezone
from email.message import EmailMessage
from email.utils import parseaddr
from typing import Any

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from app.models.email import Email

logger = logging.getLogger("triage.gmail")

_DEFAULT_MAX_RESULTS = 20
_INBOX_QUERY = "in:inbox -category:promotions -category:social"


class GmailFetchError(Exception):
    """Raised when Gmail rejects the token or the request fails."""


def _build_service(access_token: str):
    creds = Credentials(token=access_token)
    return build("gmail", "v1", credentials=creds, cache_discovery=False)


def _decode_b64(data: str) -> str:
    padded = data + "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(padded.encode("utf-8")).decode("utf-8", "replace")


_HTML_TAG_RE = re.compile(r"<[^>]+>")
_HTML_WS_RE = re.compile(r"\s+")


def _strip_html(html: str) -> str:
    text = _HTML_TAG_RE.sub(" ", html)
    return _HTML_WS_RE.sub(" ", text).strip()


def _reply_subject(subject: str) -> str:
    """Prefix `Re:` unless the subject already starts with one (any case)."""
    cleaned = (subject or "").strip()
    if not cleaned:
        return "Re:"
    if cleaned.lower().startswith("re:"):
        return cleaned
    return f"Re: {cleaned}"


def _build_reply_mime(
    to_addr: str,
    subject: str,
    in_reply_to: str | None,
    body: str,
) -> str:
    """Build a plain-text reply and return it base64url-encoded for the Gmail API."""
    msg = EmailMessage()
    msg["To"] = to_addr
    msg["Subject"] = _reply_subject(subject)
    if in_reply_to:
        msg["In-Reply-To"] = in_reply_to
        msg["References"] = in_reply_to
    msg.set_content(body)
    return base64.urlsafe_b64encode(msg.as_bytes()).decode("utf-8")


def _extract_body(payload: dict[str, Any]) -> str:
    mime_type = payload.get("mimeType", "")
    body = payload.get("body", {}) or {}
    data = body.get("data")
    if data and mime_type.startswith("text/plain"):
        return _decode_b64(data).strip()
    if data and mime_type.startswith("text/html"):
        return _strip_html(_decode_b64(data))

    for part in payload.get("parts", []) or []:
        if part.get("mimeType", "").startswith("text/plain"):
            part_data = (part.get("body") or {}).get("data")
            if part_data:
                return _decode_b64(part_data).strip()

    for part in payload.get("parts", []) or []:
        if part.get("mimeType", "").startswith("text/html"):
            part_data = (part.get("body") or {}).get("data")
            if part_data:
                return _strip_html(_decode_b64(part_data))

    for part in payload.get("parts", []) or []:
        if part.get("parts"):
            nested = _extract_body(part)
            if nested:
                return nested

    return (payload.get("snippet") or "").strip()


def _to_email(msg: dict[str, Any]) -> Email:
    headers = {
        h["name"].lower(): h.get("value", "")
        for h in (msg.get("payload", {}).get("headers") or [])
    }
    sender_raw = headers.get("from", "")
    sender_name, sender_email = parseaddr(sender_raw)
    subject = headers.get("subject", "") or "(no subject)"
    body = _extract_body(msg.get("payload", {}) or {}) or msg.get("snippet", "")
    received_at = datetime.fromtimestamp(
        int(msg.get("internalDate", "0")) / 1000,
        tz=timezone.utc,
    )
    label_ids = msg.get("labelIds") or []
    return Email(
        id=msg["id"],
        thread_id=msg.get("threadId", msg["id"]),
        sender_name=sender_name or sender_email or "Unknown",
        sender_email=sender_email or sender_raw,
        subject=subject,
        body=body,
        received_at=received_at,
        unread="UNREAD" in label_ids,
    )


def _fetch_inbox_sync(access_token: str, max_results: int) -> list[Email]:
    service = _build_service(access_token)
    try:
        listing = (
            service.users()
            .messages()
            .list(userId="me", q=_INBOX_QUERY, maxResults=max_results)
            .execute()
        )
    except HttpError as exc:
        raise GmailFetchError(f"gmail list failed: {exc}") from exc

    ids = [m["id"] for m in listing.get("messages", [])]
    if not ids:
        return []

    out: list[Email] = []
    for mid in ids:
        try:
            msg = (
                service.users()
                .messages()
                .get(userId="me", id=mid, format="full")
                .execute()
            )
        except HttpError as exc:
            logger.warning("skipping message %s: %s", mid, exc)
            continue
        out.append(_to_email(msg))
    out.sort(key=lambda e: e.received_at, reverse=True)
    return out


def _fetch_by_ids_sync(access_token: str, ids: list[str]) -> list[Email]:
    service = _build_service(access_token)
    out: list[Email] = []
    for mid in ids:
        try:
            msg = (
                service.users()
                .messages()
                .get(userId="me", id=mid, format="full")
                .execute()
            )
        except HttpError as exc:
            raise GmailFetchError(f"gmail get {mid} failed: {exc}") from exc
        out.append(_to_email(msg))
    return out


def _fetch_reply_headers_sync(service, email_id: str) -> tuple[dict[str, str], str]:
    """Return ({lowercased header: value}, thread_id) for the message being replied to."""
    try:
        msg = (
            service.users()
            .messages()
            .get(
                userId="me",
                id=email_id,
                format="metadata",
                metadataHeaders=["Message-ID", "Subject", "From"],
            )
            .execute()
        )
    except HttpError as exc:
        raise GmailFetchError(f"gmail get {email_id} failed: {exc}") from exc
    headers = {
        h["name"].lower(): h.get("value", "")
        for h in (msg.get("payload", {}).get("headers") or [])
    }
    return headers, msg.get("threadId", email_id)


def _send_reply_sync(access_token: str, email_id: str, body: str) -> dict[str, str]:
    service = _build_service(access_token)
    headers, thread_id = _fetch_reply_headers_sync(service, email_id)
    _, to_addr = parseaddr(headers.get("from", ""))
    raw = _build_reply_mime(
        to_addr=to_addr or headers.get("from", ""),
        subject=headers.get("subject", ""),
        in_reply_to=headers.get("message-id") or None,
        body=body,
    )
    try:
        sent = (
            service.users()
            .messages()
            .send(userId="me", body={"raw": raw, "threadId": thread_id})
            .execute()
        )
    except HttpError as exc:
        raise GmailFetchError(f"gmail send failed: {exc}") from exc
    return {"id": sent["id"], "thread_id": sent.get("threadId", thread_id)}


def _create_draft_reply_sync(access_token: str, email_id: str, body: str) -> dict[str, str]:
    service = _build_service(access_token)
    headers, thread_id = _fetch_reply_headers_sync(service, email_id)
    _, to_addr = parseaddr(headers.get("from", ""))
    raw = _build_reply_mime(
        to_addr=to_addr or headers.get("from", ""),
        subject=headers.get("subject", ""),
        in_reply_to=headers.get("message-id") or None,
        body=body,
    )
    try:
        draft = (
            service.users()
            .drafts()
            .create(userId="me", body={"message": {"raw": raw, "threadId": thread_id}})
            .execute()
        )
    except HttpError as exc:
        raise GmailFetchError(f"gmail draft create failed: {exc}") from exc
    return {"draft_id": draft["id"]}


async def send_reply(access_token: str, email_id: str, body: str) -> dict[str, str]:
    return await asyncio.to_thread(_send_reply_sync, access_token, email_id, body)


async def create_draft_reply(
    access_token: str, email_id: str, body: str
) -> dict[str, str]:
    return await asyncio.to_thread(_create_draft_reply_sync, access_token, email_id, body)


async def fetch_inbox(
    access_token: str,
    max_results: int = _DEFAULT_MAX_RESULTS,
) -> list[Email]:
    return await asyncio.to_thread(_fetch_inbox_sync, access_token, max_results)


async def fetch_emails_by_ids(access_token: str, ids: list[str]) -> list[Email]:
    if not ids:
        return []
    return await asyncio.to_thread(_fetch_by_ids_sync, access_token, ids)


def _get_user_email_sync(access_token: str) -> str:
    service = _build_service(access_token)
    try:
        profile = service.users().getProfile(userId="me").execute()
    except HttpError as exc:
        raise GmailFetchError(f"gmail getProfile failed: {exc}") from exc
    return profile.get("emailAddress", "")


def _compact(msg: dict[str, Any]) -> dict[str, str]:
    headers = {
        h["name"].lower(): h.get("value", "")
        for h in (msg.get("payload", {}).get("headers") or [])
    }
    label_ids = msg.get("labelIds") or []
    direction = "sent" if "SENT" in label_ids else "received"
    received_at = datetime.fromtimestamp(
        int(msg.get("internalDate", "0")) / 1000, tz=timezone.utc
    )
    return {
        "direction": direction,
        "subject": headers.get("subject", "") or "(no subject)",
        "snippet": (msg.get("snippet") or "").strip(),
        "date": received_at.isoformat(),
    }


def _search_threads_with_sync(
    access_token: str, sender_email: str, max_threads: int
) -> list[dict[str, str]]:
    service = _build_service(access_token)
    q = f"from:{sender_email} OR to:{sender_email}"
    try:
        listing = (
            service.users()
            .messages()
            .list(userId="me", q=q, maxResults=max_threads)
            .execute()
        )
    except HttpError as exc:
        raise GmailFetchError(f"gmail search failed: {exc}") from exc
    out: list[dict[str, str]] = []
    for m in listing.get("messages", []):
        try:
            msg = (
                service.users()
                .messages()
                .get(userId="me", id=m["id"], format="metadata",
                     metadataHeaders=["Subject", "From"])
                .execute()
            )
        except HttpError:
            continue
        out.append(_compact(msg))
    return out


def _sample_sent_sync(access_token: str, max_messages: int) -> list[str]:
    service = _build_service(access_token)
    try:
        listing = (
            service.users()
            .messages()
            .list(userId="me", q="in:sent", maxResults=max_messages)
            .execute()
        )
    except HttpError as exc:
        raise GmailFetchError(f"gmail sent list failed: {exc}") from exc
    bodies: list[str] = []
    for m in listing.get("messages", []):
        try:
            msg = (
                service.users()
                .messages()
                .get(userId="me", id=m["id"], format="full")
                .execute()
            )
        except HttpError:
            continue
        body = _extract_body(msg.get("payload", {}) or {})
        if body:
            bodies.append(body[:2000])
    return bodies


def _compact_full(msg: dict[str, Any]) -> dict[str, str]:
    """Like ``_compact`` but carries the full extracted body (capped) instead of
    Gmail's ~100-char snippet, so the drafter can mine concrete facts."""
    headers = {
        h["name"].lower(): h.get("value", "")
        for h in (msg.get("payload", {}).get("headers") or [])
    }
    label_ids = msg.get("labelIds") or []
    direction = "sent" if "SENT" in label_ids else "received"
    received_at = datetime.fromtimestamp(
        int(msg.get("internalDate", "0")) / 1000, tz=timezone.utc
    )
    body = _extract_body(msg.get("payload", {}) or {})
    return {
        "direction": direction,
        "subject": headers.get("subject", "") or "(no subject)",
        "date": received_at.isoformat(),
        "body": body[:2000],
    }


def _fetch_contact_bodies_sync(
    access_token: str, query: str, max_messages: int
) -> list[dict[str, str]]:
    service = _build_service(access_token)
    try:
        listing = (
            service.users()
            .messages()
            .list(userId="me", q=query, maxResults=max_messages)
            .execute()
        )
    except HttpError as exc:
        raise GmailFetchError(f"gmail contact-body search failed: {exc}") from exc
    out: list[dict[str, str]] = []
    for m in listing.get("messages", []):
        try:
            msg = (
                service.users()
                .messages()
                .get(userId="me", id=m["id"], format="full")
                .execute()
            )
        except HttpError:
            continue
        out.append(_compact_full(msg))
    return out


def _sample_replies_to_sync(
    access_token: str, contact_email: str, max_messages: int
) -> list[dict[str, str]]:
    return _fetch_contact_bodies_sync(
        access_token, f"in:sent to:{contact_email}", max_messages
    )


def _fetch_contact_history_sync(
    access_token: str, contact_email: str, max_messages: int
) -> list[dict[str, str]]:
    return _fetch_contact_bodies_sync(
        access_token, f"from:{contact_email} OR to:{contact_email}", max_messages
    )


async def get_user_email(access_token: str) -> str:
    return await asyncio.to_thread(_get_user_email_sync, access_token)


async def search_threads_with(
    access_token: str, sender_email: str, max_threads: int = 10
) -> list[dict[str, str]]:
    return await asyncio.to_thread(
        _search_threads_with_sync, access_token, sender_email, max_threads
    )


async def sample_sent(access_token: str, max_messages: int = 25) -> list[str]:
    return await asyncio.to_thread(_sample_sent_sync, access_token, max_messages)


async def sample_replies_to(
    access_token: str, contact_email: str, max_messages: int = 3
) -> list[dict[str, str]]:
    """The seller's own recent replies to one contact (full text) — used as
    few-shot tone/structure exemplars for the drafter."""
    return await asyncio.to_thread(
        _sample_replies_to_sync, access_token, contact_email, max_messages
    )


async def fetch_contact_history(
    access_token: str, contact_email: str, max_messages: int = 8
) -> list[dict[str, str]]:
    """Full-text emails to/from one contact (both directions) — used by the
    drafter to pull concrete facts already discussed."""
    return await asyncio.to_thread(
        _fetch_contact_history_sync, access_token, contact_email, max_messages
    )
