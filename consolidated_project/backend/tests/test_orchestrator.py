import pytest
from datetime import datetime, timezone

from app.agent.tools import DRAFTER_TOOL_NAMES, TOOL_NAMES
from app.models.email import Email
import app.agent.orchestrator as orch


def test_build_options_preapproves_triage_tools():
    """Headless query() denies any MCP tool not pre-approved in allowed_tools.
    Every enrichment + drafter tool must be listed or it is silently denied
    at runtime (returns 'no history' and the agent drafts blind)."""
    allowed = set(orch._build_options().allowed_tools)
    assert "Agent" in allowed
    for name in (*TOOL_NAMES, *DRAFTER_TOOL_NAMES):
        assert name in allowed, f"{name} not pre-approved -> denied at runtime"


class _FakeResult:
    def __init__(self, structured):
        self.structured_output = structured
        self.is_error = False


async def _fake_query(*, prompt, options):
    yield _FakeResult({
        "email_id": "m1",
        "signal": {"intent": "deal", "priority": 90, "bucket": "act_today", "reason": "top Q4 deal"},
        "summary": "Acme legal sent redlines blocking signature.",
        "actions": [{"kind": "reply", "label": "Send redline response", "due_hint": "today"}],
        "draft_reply": "Hi - attaching the redline response. Can we close Friday?",
    })


async def _fake_user_email(token):
    return "seller@x.com"


def _email():
    return Email(
        id="m1", thread_id="t1", sender_name="Buyer", sender_email="buyer@acme.com",
        subject="Redlines", body="Please review.", received_at=datetime.now(timezone.utc),
    )


@pytest.mark.asyncio
async def test_triage_email_returns_validated_result(monkeypatch):
    monkeypatch.setattr(orch, "query", _fake_query)
    monkeypatch.setattr(orch.gmail, "get_user_email", _fake_user_email)
    result = await orch.triage_email(_email(), "I sell to Acme", token="tok")
    assert result.email_id == "m1"
    assert result.signal.priority == 90
    assert result.draft_reply.startswith("Hi")


@pytest.mark.asyncio
async def test_triage_email_raises_on_error_result(monkeypatch):
    class _Err:
        structured_output = None
        is_error = True

    async def _q(*, prompt, options):
        yield _Err()

    monkeypatch.setattr(orch, "query", _q)
    monkeypatch.setattr(orch.gmail, "get_user_email", _fake_user_email)
    with pytest.raises(RuntimeError):
        await orch.triage_email(_email(), "ctx", token="tok")
