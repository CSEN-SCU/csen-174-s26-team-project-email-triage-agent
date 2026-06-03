import base64

import pytest
from app.auth import gmail


def _b64(text: str) -> str:
    return base64.urlsafe_b64encode(text.encode()).decode().rstrip("=")


class _Exec:
    def __init__(self, value):
        self._value = value

    def execute(self):
        return self._value


class _FakeMessages:
    def __init__(self, listing, msgs):
        self._listing, self._msgs = listing, msgs

    def list(self, **_):  # noqa: A003
        return _Exec(self._listing)

    def get(self, *, id, **_):
        return _Exec(self._msgs[id])


class _FakeThreads:
    def __init__(self, threads):
        self._threads = threads or {}

    def get(self, *, id, **_):
        return _Exec(self._threads[id])


class _FakeUsers:
    def __init__(self, messages, threads=None):
        self._messages = messages
        self._threads = _FakeThreads(threads)

    def messages(self):
        return self._messages

    def threads(self):
        return self._threads

    def getProfile(self, **_):
        return _Exec({"emailAddress": "seller@example.com"})


class _FakeService:
    def __init__(self, messages, threads=None):
        self._users = _FakeUsers(messages, threads)

    def users(self):
        return self._users


@pytest.mark.asyncio
async def test_get_user_email(monkeypatch):
    monkeypatch.setattr(gmail, "_build_service", lambda token: _FakeService(_FakeMessages({}, {})))
    assert await gmail.get_user_email("tok") == "seller@example.com"


@pytest.mark.asyncio
async def test_search_threads_with_returns_compact_records(monkeypatch):
    listing = {"messages": [{"id": "m1"}]}
    msgs = {
        "m1": {
            "id": "m1",
            "labelIds": ["SENT"],
            "snippet": "thanks for the call",
            "internalDate": "1700000000000",
            "payload": {"headers": [
                {"name": "Subject", "value": "Re: Pricing"},
                {"name": "From", "value": "Me <seller@example.com>"},
            ]},
        }
    }
    monkeypatch.setattr(gmail, "_build_service", lambda token: _FakeService(_FakeMessages(listing, msgs)))
    out = await gmail.search_threads_with("tok", "buyer@acme.com", max_threads=5)
    assert out and out[0]["subject"] == "Re: Pricing"
    assert out[0]["direction"] == "sent"
    assert "thanks" in out[0]["snippet"]


def _inbox_msg(mid: str, thread_id: str) -> dict:
    return {
        "id": mid,
        "threadId": thread_id,
        "labelIds": ["INBOX", "UNREAD"],
        "internalDate": "1700000000000",
        "payload": {
            "mimeType": "text/plain",
            "body": {"data": _b64("hello there")},
            "headers": [
                {"name": "Subject", "value": "Question"},
                {"name": "From", "value": "Buyer <buyer@acme.com>"},
            ],
        },
    }


@pytest.mark.asyncio
async def test_fetch_inbox_skips_threads_user_replied_to_last(monkeypatch):
    # t1: latest message is SENT by the seller -> skip. t2: latest is received -> keep.
    listing = {"messages": [{"id": "m1", "threadId": "t1"}, {"id": "m2", "threadId": "t2"}]}
    msgs = {"m1": _inbox_msg("m1", "t1"), "m2": _inbox_msg("m2", "t2")}
    threads = {
        "t1": {"messages": [
            {"internalDate": "1700000000000", "labelIds": ["INBOX"]},
            {"internalDate": "1700000999000", "labelIds": ["SENT"]},  # seller replied last
        ]},
        "t2": {"messages": [
            {"internalDate": "1700000000000", "labelIds": ["SENT"]},
            {"internalDate": "1700000999000", "labelIds": ["INBOX"]},  # buyer wrote last
        ]},
    }
    monkeypatch.setattr(gmail, "_build_service", lambda token: _FakeService(_FakeMessages(listing, msgs), threads))
    out = await gmail.fetch_inbox("tok")
    ids = {e.id for e in out}
    assert ids == {"m2"}, "thread the seller replied to last should be skipped"


@pytest.mark.asyncio
async def test_fetch_inbox_skip_replied_disabled_keeps_all(monkeypatch):
    listing = {"messages": [{"id": "m1", "threadId": "t1"}]}
    msgs = {"m1": _inbox_msg("m1", "t1")}
    threads = {"t1": {"messages": [{"internalDate": "1700000999000", "labelIds": ["SENT"]}]}}
    monkeypatch.setattr(gmail, "_build_service", lambda token: _FakeService(_FakeMessages(listing, msgs), threads))
    out = await gmail.fetch_inbox("tok", skip_replied=False)
    assert {e.id for e in out} == {"m1"}


@pytest.mark.asyncio
async def test_sample_replies_to_returns_full_bodies(monkeypatch):
    listing = {"messages": [{"id": "m1"}]}
    msgs = {
        "m1": {
            "id": "m1",
            "labelIds": ["SENT"],
            "internalDate": "1700000000000",
            "payload": {
                "mimeType": "text/plain",
                "body": {"data": _b64("Happy to do 15% off through Q4. Talk soon, Sam")},
                "headers": [{"name": "Subject", "value": "Re: Pricing"}],
            },
        }
    }
    monkeypatch.setattr(gmail, "_build_service", lambda token: _FakeService(_FakeMessages(listing, msgs)))
    out = await gmail.sample_replies_to("tok", "buyer@acme.com", max_messages=3)
    assert out[0]["direction"] == "sent"
    assert out[0]["subject"] == "Re: Pricing"
    assert "15% off" in out[0]["body"]


@pytest.mark.asyncio
async def test_fetch_contact_history_carries_received_body(monkeypatch):
    listing = {"messages": [{"id": "m1"}]}
    msgs = {
        "m1": {
            "id": "m1",
            "labelIds": ["INBOX"],
            "internalDate": "1700000000000",
            "payload": {
                "mimeType": "text/plain",
                "body": {"data": _b64("Can you confirm the SOC 2 report timeline?")},
                "headers": [{"name": "Subject", "value": "Security"}],
            },
        }
    }
    monkeypatch.setattr(gmail, "_build_service", lambda token: _FakeService(_FakeMessages(listing, msgs)))
    out = await gmail.fetch_contact_history("tok", "buyer@acme.com", max_messages=8)
    assert out[0]["direction"] == "received"
    assert "SOC 2" in out[0]["body"]
