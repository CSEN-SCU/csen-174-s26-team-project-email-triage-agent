"""AgentDefinitions for the two triage subagents."""
from __future__ import annotations

from claude_agent_sdk import AgentDefinition

from app.agent.prompts import DRAFT_REPLY_PROMPT, ENRICHMENT_PROMPT
from app.agent.tools import TOOL_NAMES
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
            description="Write the reply body in the seller's voice using the enrichment profile.",
            prompt=(
                DRAFT_REPLY_PROMPT
                + "\n\nYou will be given a VOICE/RELATIONSHIP profile. Honor it: "
                "match greeting, sign-off, formality, and length. Keep placeholders "
                "for facts you do not have."
            ),
            tools=[],
            model=settings.triage_model,
        ),
    }
