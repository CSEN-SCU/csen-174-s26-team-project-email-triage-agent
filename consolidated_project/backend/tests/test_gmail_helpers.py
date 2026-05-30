import pytest
from app.auth import gmail


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


class _FakeUsers:
    def __init__(self, messages):
        self._messages = messages

    def messages(self):
        return self._messages

    def getProfile(self, **_):
        return _Exec({"emailAddress": "seller@example.com"})


class _FakeService:
    def __init__(self, messages):
        self._users = _FakeUsers(messages)

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
