"""In-process Claude Agent SDK tools for the triage agent.

Tools are stateless; the per-request OAuth token and user email come from
``app.agent.context`` contextvars. Gmail failures degrade gracefully so the
enrichment subagent can still produce a (weaker) profile.
"""
from __future__ import annotations

import json
import logging

from claude_agent_sdk import create_sdk_mcp_server, tool

from app.agent import context
from app.auth import gmail
from app.auth.gmail import GmailFetchError
import app.profile_repository as repo

logger = logging.getLogger("triage.tools")


def _ok(text: str) -> dict:
    return {"content": [{"type": "text", "text": text}]}


async def _gmail_sender_history_impl(args: dict) -> dict:
    token = context.get_access_token()
    if not token:
        return _ok("no history available (not authenticated)")
    try:
        rows = await gmail.search_threads_with(
            token, args["sender_email"], int(args.get("max_threads", 10))
        )
    except GmailFetchError as exc:
        logger.warning("sender history failed: %s", exc)
        return _ok("no history available (gmail error)")
    if not rows:
        return _ok("no prior history with this sender")
    return _ok(json.dumps(rows))


async def _gmail_sample_sent_impl(args: dict) -> dict:
    token = context.get_access_token()
    if not token:
        return _ok("no sent mail available (not authenticated)")
    try:
        bodies = await gmail.sample_sent(token, int(args.get("max_messages", 25)))
    except GmailFetchError as exc:
        logger.warning("sample sent failed: %s", exc)
        return _ok("no sent mail available (gmail error)")
    if not bodies:
        return _ok("no sent mail found")
    return _ok(json.dumps(bodies))


async def _read_profile_cache_impl(args: dict) -> dict:
    kind, key = args["kind"], args["key"]
    if kind == "voice":
        user_email = context.get_user_email() or key
        prof = await repo.read_voice_profile(user_email)
    else:
        user_email = context.get_user_email() or ""
        prof = await repo.read_relationship_profile(user_email, key)
    return _ok(json.dumps(prof) if prof is not None else "cache miss")


async def _write_profile_cache_impl(args: dict) -> dict:
    kind, key = args["kind"], args["key"]
    profile = args["profile_json"]
    if isinstance(profile, str):
        try:
            profile = json.loads(profile)
        except json.JSONDecodeError:
            profile = {"text": profile}
    if kind == "voice":
        user_email = context.get_user_email() or key
        await repo.write_voice_profile(user_email, profile)
    else:
        user_email = context.get_user_email() or ""
        await repo.write_relationship_profile(user_email, key, profile)
    return _ok("saved")


@tool("gmail_sender_history", "Fetch recent emails to/from a sender to infer the relationship.",
      {"sender_email": str, "max_threads": int})
async def gmail_sender_history(args: dict) -> dict:
    return await _gmail_sender_history_impl(args)


@tool("gmail_sample_sent", "Sample the seller's recent Sent emails to infer their writing voice.",
      {"max_messages": int})
async def gmail_sample_sent(args: dict) -> dict:
    return await _gmail_sample_sent_impl(args)


@tool("read_profile_cache", "Read a cached profile. kind is 'voice' or 'relationship'.",
      {"kind": str, "key": str})
async def read_profile_cache(args: dict) -> dict:
    return await _read_profile_cache_impl(args)


@tool("write_profile_cache", "Persist a profile. kind is 'voice' or 'relationship'.",
      {"kind": str, "key": str, "profile_json": str})
async def write_profile_cache(args: dict) -> dict:
    return await _write_profile_cache_impl(args)


triage_mcp_server = create_sdk_mcp_server(
    name="triage",
    version="1.0.0",
    tools=[gmail_sender_history, gmail_sample_sent, read_profile_cache, write_profile_cache],
)

# Fully-qualified tool names the SDK exposes (mcp__{server}__{tool}).
TOOL_NAMES = [
    "mcp__triage__gmail_sender_history",
    "mcp__triage__gmail_sample_sent",
    "mcp__triage__read_profile_cache",
    "mcp__triage__write_profile_cache",
]
