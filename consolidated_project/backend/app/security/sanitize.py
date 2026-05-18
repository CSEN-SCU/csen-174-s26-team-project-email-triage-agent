"""Input sanitization for free-text user context.

The `user_context` blurb is dropped into LLM prompts that the agent uses to
classify, summarize, and draft replies. Because the same string also flows
through logs and (optionally) a database layer downstream, we defensively
strip three classes of payloads before persisting it:

1. SQL injection signatures (quotes, comment markers, common keywords)
2. Prompt-injection / jailbreak patterns aimed at the agent
3. Control characters and oversized inputs that would corrupt prompts

Sanitization is conservative: we redact rather than reject, so a benign user
who happens to mention the word "SELECT" still gets a working triage.
"""

from __future__ import annotations

import re

MAX_CONTEXT_LEN = 4000

_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")

_SQL_PATTERNS: tuple[re.Pattern[str], ...] = (
    re.compile(r"(--|#|/\*|\*/)"),
    re.compile(
        r";\s*(drop|delete|update|insert|alter|truncate|create|grant|revoke)\b",
        re.IGNORECASE,
    ),
    re.compile(r"\b(union\s+all\s+select|union\s+select)\b", re.IGNORECASE),
    re.compile(r"\b(or|and)\s+\d+\s*=\s*\d+", re.IGNORECASE),
    re.compile(r"\bxp_\w+", re.IGNORECASE),
    re.compile(r"\b(exec(ute)?|sp_executesql)\s*\(", re.IGNORECASE),
)

_PROMPT_INJECTION_PATTERNS: tuple[re.Pattern[str], ...] = (
    re.compile(
        r"ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts?|rules)",
        re.IGNORECASE,
    ),
    re.compile(r"disregard\s+(the\s+)?(system|previous|above)", re.IGNORECASE),
    re.compile(r"you\s+are\s+now\s+(a|an)\s+", re.IGNORECASE),
    re.compile(r"act\s+as\s+(a|an)\s+(?:different|new)", re.IGNORECASE),
    re.compile(r"reveal\s+(your|the)\s+(system\s+)?(prompt|instructions)", re.IGNORECASE),
    re.compile(r"</?(system|assistant|user)>", re.IGNORECASE),
)

_REDACTION = "[redacted]"


def sanitize_user_context(raw: str) -> str:
    """Return a safe-to-prompt version of `raw`.

    Strips control characters, caps length, and redacts SQL-injection and
    prompt-injection signatures. Always returns a string (empty if `raw` is
    falsy after cleaning) so callers can fall back to a default context.
    """
    if not raw:
        return ""

    cleaned = _CONTROL_CHARS.sub("", raw)

    for pattern in _SQL_PATTERNS:
        cleaned = pattern.sub(_REDACTION, cleaned)
    for pattern in _PROMPT_INJECTION_PATTERNS:
        cleaned = pattern.sub(_REDACTION, cleaned)

    # Neutralize the prompt-template tags so a user can't close our
    # `<user_context>` wrapper and forge an `<email>` or `<system>` block.
    cleaned = cleaned.replace("<user_context>", "&lt;user_context&gt;")
    cleaned = cleaned.replace("</user_context>", "&lt;/user_context&gt;")

    cleaned = cleaned.strip()
    if len(cleaned) > MAX_CONTEXT_LEN:
        cleaned = cleaned[:MAX_CONTEXT_LEN].rstrip() + "…"
    return cleaned
