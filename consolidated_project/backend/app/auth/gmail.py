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


async def fetch_inbox(
    access_token: str,
    max_results: int = _DEFAULT_MAX_RESULTS,
) -> list[Email]:
    return await asyncio.to_thread(_fetch_inbox_sync, access_token, max_results)


async def fetch_emails_by_ids(access_token: str, ids: list[str]) -> list[Email]:
    if not ids:
        return []
    return await asyncio.to_thread(_fetch_by_ids_sync, access_token, ids)
