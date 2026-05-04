"""LangGraph triage agent.

Graph shape (per email):

    classify ──► summarize ──► extract_actions ──► maybe_draft_reply ──► END

classify uses the cheap model (Haiku); everything downstream uses the triage
model (Sonnet). maybe_draft_reply branches: we only spend tokens on a draft
when the email is action-worthy (bucket = act_today or intent requires reply).
"""

from __future__ import annotations

import json
import logging
import time
from typing import TypedDict

from anthropic import Anthropic
from langgraph.graph import END, StateGraph

logger = logging.getLogger("triage.graph")

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
    logger.info(
        "  └─ anthropic.messages.create model=%s prompt_chars=%d max_tokens=%d",
        model,
        len(prompt),
        max_tokens,
    )
    t0 = time.perf_counter()
    msg = _anthropic().messages.create(
        model=model,
        max_tokens=max_tokens,
        system=SYSTEM_PREAMBLE,
        messages=[{"role": "user", "content": prompt}],
    )
    elapsed_ms = (time.perf_counter() - t0) * 1000
    text = "".join(block.text for block in msg.content if block.type == "text").strip()
    usage = getattr(msg, "usage", None)
    if usage is not None:
        logger.info(
            "     ↳ ok in %.0fms · in=%s out=%s · response_chars=%d",
            elapsed_ms,
            getattr(usage, "input_tokens", "?"),
            getattr(usage, "output_tokens", "?"),
            len(text),
        )
    else:
        logger.info("     ↳ ok in %.0fms · response_chars=%d", elapsed_ms, len(text))
    return text


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
    logger.info("[node: classify] email=%s subject=%r", email.id, email.subject)
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
    signal = TriageSignal(
        intent=Intent(data["intent"]),
        priority=priority,
        bucket=Bucket(bucket_str),
        reason=data["reason"],
    )
    logger.info(
        "  → signal intent=%s priority=%d bucket=%s",
        signal.intent.value,
        signal.priority,
        signal.bucket.value,
    )
    return {"signal": signal}


def summarize_node(state: TriageState) -> TriageState:
    email = state["email"]
    logger.info("[node: summarize] email=%s", email.id)
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
    logger.info("  → summary (%d chars)", len(summary))
    return {"summary": summary}


def actions_node(state: TriageState) -> TriageState:
    email = state["email"]
    signal = state["signal"]
    logger.info("[node: actions] email=%s", email.id)
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
    actions = [ActionItem(**item) for item in items]
    logger.info("  → extracted %d action item(s)", len(actions))
    return {"actions": actions}


def draft_reply_node(state: TriageState) -> TriageState:
    email = state["email"]
    logger.info("[node: draft] email=%s — generating reply", email.id)
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
    logger.info("  → draft ready (%d chars)", len(draft))
    return {"draft_reply": draft}


def skip_draft_node(state: TriageState) -> TriageState:
    logger.info("[node: skip_draft] email=%s — no draft generated", state["email"].id)
    return {"draft_reply": None}


def _should_draft(state: TriageState) -> str:
    signal = state["signal"]
    if signal.bucket == Bucket.FYI:
        decision = "skip"
        reason = "bucket=fyi"
    elif signal.intent in {Intent.COLD_OUTREACH, Intent.VENDOR, Intent.RECRUITING}:
        decision = "skip"
        reason = f"intent={signal.intent.value}"
    else:
        decision = "draft"
        reason = f"bucket={signal.bucket.value} intent={signal.intent.value}"
    logger.info("[router: should_draft] → %s (%s)", decision, reason)
    return decision


def build_graph():
    logger.info(
        "Building LangGraph: classify → summarize → actions → {draft|skip} → END"
    )
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
    logger.info(
        "═══ triage_email start · id=%s from=%s subject=%r",
        email.id,
        email.sender_email,
        email.subject,
    )
    t0 = time.perf_counter()
    final = graph.invoke({"email": email, "user_context": user_context})
    elapsed = time.perf_counter() - t0
    signal = final["signal"]
    logger.info(
        "═══ triage_email done · id=%s in %.2fs · bucket=%s priority=%d draft=%s",
        email.id,
        elapsed,
        signal.bucket.value,
        signal.priority,
        "yes" if final.get("draft_reply") else "no",
    )
    return TriageResult(
        email_id=email.id,
        signal=signal,
        summary=final["summary"],
        actions=final["actions"],
        draft_reply=final.get("draft_reply"),
    )
