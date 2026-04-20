"""LangGraph triage agent.

Graph shape (per email):

    classify ──► summarize ──► extract_actions ──► maybe_draft_reply ──► END

classify uses the cheap model (Haiku); everything downstream uses the triage
model (Sonnet). maybe_draft_reply branches: we only spend tokens on a draft
when the email is action-worthy (bucket = act_today or intent requires reply).
"""

from __future__ import annotations

import json
from typing import TypedDict

from anthropic import Anthropic
from langgraph.graph import END, StateGraph

from app.agent.prompts import (
    ACTIONS_PROMPT,
    CLASSIFY_PROMPT,
    DRAFT_REPLY_PROMPT,
    SUMMARIZE_PROMPT,
    SYSTEM_PREAMBLE,
)
from app.config import settings
from app.models.email import (
    ActionItem,
    Bucket,
    Email,
    Intent,
    TriageResult,
    TriageSignal,
)


class TriageState(TypedDict, total=False):
    email: Email
    user_context: str
    signal: TriageSignal
    summary: str
    actions: list[ActionItem]
    draft_reply: str | None


_client: Anthropic | None = None


def _anthropic() -> Anthropic:
    global _client
    if _client is None:
        key = settings.api_key
        if not key:
            raise RuntimeError(
                "ANTHROPIC_API_KEY (or CLAUDE_API_KEY) is not set. "
                "Copy .env.example to .env and add your key."
            )
        _client = Anthropic(api_key=key)
    return _client


def _call(model: str, prompt: str, max_tokens: int = 1024) -> str:
    msg = _anthropic().messages.create(
        model=model,
        max_tokens=max_tokens,
        system=SYSTEM_PREAMBLE,
        messages=[{"role": "user", "content": prompt}],
    )
    return "".join(block.text for block in msg.content if block.type == "text").strip()


def _extract_json(text: str) -> str:
    """Strip fences or prose that sometimes wrap JSON output."""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```", 2)[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip("` \n")
    start = min(
        (i for i in (text.find("{"), text.find("[")) if i != -1),
        default=-1,
    )
    if start == -1:
        return text
    return text[start:]


def classify_node(state: TriageState) -> TriageState:
    email = state["email"]
    prompt = CLASSIFY_PROMPT.format(
        user_context=state["user_context"],
        sender_name=email.sender_name,
        sender_email=email.sender_email,
        subject=email.subject,
        received_at=email.received_at.isoformat(),
        body=email.body,
    )
    raw = _call(settings.classify_model, prompt, max_tokens=400)
    data = json.loads(_extract_json(raw))
    priority = int(data["priority"])
    bucket_str = data.get("bucket") or (
        "act_today"
        if priority >= 80
        else "decide_this_week" if priority >= 40 else "fyi"
    )
    return {
        "signal": TriageSignal(
            intent=Intent(data["intent"]),
            priority=priority,
            bucket=Bucket(bucket_str),
            reason=data["reason"],
        )
    }


def summarize_node(state: TriageState) -> TriageState:
    email = state["email"]
    summary = _call(
        settings.triage_model,
        SUMMARIZE_PROMPT.format(
            user_context=state["user_context"],
            sender_name=email.sender_name,
            subject=email.subject,
            body=email.body,
        ),
        max_tokens=200,
    )
    return {"summary": summary}


def actions_node(state: TriageState) -> TriageState:
    email = state["email"]
    signal = state["signal"]
    prompt = ACTIONS_PROMPT.format(
        user_context=state["user_context"],
        sender_name=email.sender_name,
        subject=email.subject,
        body=email.body,
        intent=signal.intent.value,
        priority=signal.priority,
        bucket=signal.bucket.value,
    )
    raw = _call(settings.triage_model, prompt, max_tokens=400)
    items = json.loads(_extract_json(raw))
    return {"actions": [ActionItem(**item) for item in items]}


def draft_reply_node(state: TriageState) -> TriageState:
    email = state["email"]
    draft = _call(
        settings.triage_model,
        DRAFT_REPLY_PROMPT.format(
            user_context=state["user_context"],
            sender_name=email.sender_name,
            sender_email=email.sender_email,
            subject=email.subject,
            body=email.body,
        ),
        max_tokens=600,
    )
    return {"draft_reply": draft}


def skip_draft_node(state: TriageState) -> TriageState:
    return {"draft_reply": None}


def _should_draft(state: TriageState) -> str:
    signal = state["signal"]
    if signal.bucket == Bucket.FYI:
        return "skip"
    if signal.intent in {Intent.COLD_OUTREACH, Intent.VENDOR, Intent.RECRUITING}:
        return "skip"
    return "draft"


def build_graph():
    g = StateGraph(TriageState)
    g.add_node("classify_node", classify_node)
    g.add_node("summarize_node", summarize_node)
    g.add_node("actions_node", actions_node)
    g.add_node("draft_node", draft_reply_node)
    g.add_node("skip_draft_node", skip_draft_node)

    g.set_entry_point("classify_node")
    g.add_edge("classify_node", "summarize_node")
    g.add_edge("summarize_node", "actions_node")
    g.add_conditional_edges(
        "actions_node",
        _should_draft,
        {"draft": "draft_node", "skip": "skip_draft_node"},
    )
    g.add_edge("draft_node", END)
    g.add_edge("skip_draft_node", END)

    return g.compile()


_graph = None


def get_graph():
    global _graph
    if _graph is None:
        _graph = build_graph()
    return _graph


def triage_email(email: Email, user_context: str) -> TriageResult:
    graph = get_graph()
    final = graph.invoke({"email": email, "user_context": user_context})
    return TriageResult(
        email_id=email.id,
        signal=final["signal"],
        summary=final["summary"],
        actions=final["actions"],
        draft_reply=final.get("draft_reply"),
    )
