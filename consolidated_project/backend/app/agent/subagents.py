"""AgentDefinitions for the two triage subagents."""
from __future__ import annotations

from claude_agent_sdk import AgentDefinition

from app.agent.prompts import DRAFT_REPLY_PROMPT, ENRICHMENT_PROMPT
from app.agent.tools import DRAFTER_TOOL_NAMES, TOOL_NAMES
from app.config import settings


def build_agents() -> dict[str, AgentDefinition]:
    return {
        "context-enrichment": AgentDefinition(
            description=(
                "Build a relationship + writing-voice profile before drafting a "
                "reply. Use whenever a reply will be drafted."
            ),
            prompt=ENRICHMENT_PROMPT,
            tools=list(TOOL_NAMES),
            model=settings.classify_model,
        ),
        "drafter": AgentDefinition(
            description=(
                "Write the reply body in the seller's voice, mirroring how they "
                "actually wrote to this contact and reusing facts from prior emails."
            ),
            prompt=(
                DRAFT_REPLY_PROMPT
                + "\n\nYou are given a VOICE/RELATIONSHIP profile and the contact's "
                "email address. Before writing:\n"
                "1. Call gmail_past_replies(contact_email=...) to see how the seller "
                "actually writes to THIS person. Mirror their greeting, sign-off, "
                "formality, length, and structure — treat these as style exemplars, "
                "not content to copy verbatim.\n"
                "2. Call gmail_lookup_history(contact_email=...) and reuse concrete "
                "facts already discussed (prices, dates, commitments, names) instead "
                "of placeholders. Only use a clearly-marked [placeholder] when the "
                "needed fact is genuinely absent from the history.\n"
                "If a tool returns no history, fall back to the profile and the "
                "default seller voice. Always honor the profile's greeting, "
                "sign-off, formality, and length."
            ),
            tools=DRAFTER_TOOL_NAMES,
            model=settings.triage_model,
        ),
    }
