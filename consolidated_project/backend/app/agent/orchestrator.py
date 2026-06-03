"""Claude Agent SDK orchestrator. One query() per email; subagents handle
enrichment and drafting; structured output yields a validated TriageResult.
"""
from __future__ import annotations

import logging

from claude_agent_sdk import ClaudeAgentOptions, query

from app.agent import context
from app.agent.prompts import ORCHESTRATOR_FLOW, SYSTEM_PREAMBLE
from app.agent.subagents import build_agents
from app.agent.tools import DRAFTER_TOOL_NAMES, TOOL_NAMES, triage_mcp_server
from app.auth import gmail
from app.config import settings
from app.models.email import Email, TriageResult

logger = logging.getLogger("triage.orchestrator")

_RESULT_SCHEMA = TriageResult.model_json_schema()


def _build_options() -> ClaudeAgentOptions:
    return ClaudeAgentOptions(
        model=settings.triage_model,
        system_prompt=f"{SYSTEM_PREAMBLE}\n\n{ORCHESTRATOR_FLOW}",
        agents=build_agents(),
        mcp_servers={"triage": triage_mcp_server},
        # Headless query() denies any tool not pre-approved here (verified: an
        # un-listed MCP tool is recorded in permission_denials and never runs).
        # The enrichment + drafter subagents call these in-process Gmail/cache
        # tools, so every one must be listed or it silently degrades to
        # "no history" and the agent drafts without any past-email context.
        allowed_tools=["Agent", *TOOL_NAMES, *DRAFTER_TOOL_NAMES],
        setting_sources=[],
        output_format={"type": "json_schema", "schema": _RESULT_SCHEMA},
    )


def _build_prompt(email: Email, user_context: str, user_email: str) -> str:
    return (
        f"<user_context>\n{user_context}\n</user_context>\n"
        f"<seller_email>{user_email}</seller_email>\n"
        f"<email>\nid: {email.id}\nFrom: {email.sender_name} <{email.sender_email}>\n"
        f"Subject: {email.subject}\nReceived: {email.received_at.isoformat()}\n\n"
        f"{email.body}\n</email>\n\n"
        "Triage this email and return the structured TriageResult."
    )


async def triage_email(email: Email, user_context: str, token: str | None) -> TriageResult:
    with context.request_context(token):
        user_email = ""
        if token:
            try:
                user_email = await gmail.get_user_email(token)
            except gmail.GmailFetchError:
                logger.warning("get_user_email failed; proceeding with empty seller email")
        context.set_user_email(user_email)
        prompt = _build_prompt(email, user_context, user_email)
        structured = None
        async for message in query(prompt=prompt, options=_build_options()):
            if getattr(message, "is_error", False):
                raise RuntimeError(f"orchestrator error for {email.id}")
            if getattr(message, "structured_output", None) is not None:
                structured = message.structured_output
        if structured is None:
            raise RuntimeError(f"orchestrator returned no structured output for {email.id}")
        structured.setdefault("email_id", email.id)
        return TriageResult(**structured)
