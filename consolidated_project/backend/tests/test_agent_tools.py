import json
import pytest
from app.agent import tools, context
from app.auth import gmail
import app.profile_repository as repo


def _text(result: dict) -> str:
    return result["content"][0]["text"]


@pytest.mark.asyncio
async def test_gmail_sender_history_tool(monkeypatch):
    async def fake_search(token, sender_email, max_threads=10):
        assert token == "tok"
        return [{"direction": "sent", "subject": "Re: Pricing", "snippet": "thanks", "date": "2026-01-01T00:00:00+00:00"}]

    monkeypatch.setattr(gmail, "search_threads_with", fake_search)
    with context.request_context("tok"):
        out = await tools._gmail_sender_history_impl({"sender_email": "buyer@acme.com"})
    assert "Re: Pricing" in _text(out)


@pytest.mark.asyncio
async def test_gmail_tool_without_token_returns_no_history():
    out = await tools._gmail_sender_history_impl({"sender_email": "buyer@acme.com"})
    assert "no history" in _text(out).lower()


@pytest.mark.asyncio
async def test_read_profile_cache_voice_hit(monkeypatch):
    async def fake_read(user_email, ttl_days=7):
        return {"tone": "warm"}

    monkeypatch.setattr(repo, "read_voice_profile", fake_read)
    with context.request_context("tok"):
        context.set_user_email("seller@x.com")
        out = await tools._read_profile_cache_impl({"kind": "voice", "key": "seller@x.com"})
    assert json.loads(_text(out))["tone"] == "warm"
