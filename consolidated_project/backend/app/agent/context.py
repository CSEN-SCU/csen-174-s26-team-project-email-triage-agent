"""Per-request context for the triage agent.

The Claude Agent SDK's custom tools are stateless (handlers receive only their
``args``). The per-request Gmail OAuth token and the resolved user email are
carried here via ``ContextVar`` so tool handlers can read them without a
closure. ``request_context`` is a context manager that sets and resets safely,
so concurrent requests never see each other's token.
"""
from __future__ import annotations

import contextlib
from contextvars import ContextVar

_access_token: ContextVar[str | None] = ContextVar("triage_access_token", default=None)
_user_email: ContextVar[str | None] = ContextVar("triage_user_email", default=None)


def get_access_token() -> str | None:
    return _access_token.get()


def get_user_email() -> str | None:
    return _user_email.get()


def set_user_email(email: str | None) -> None:
    _user_email.set(email)


@contextlib.contextmanager
def request_context(token: str | None):
    token_reset = _access_token.set(token)
    email_reset = _user_email.set(None)
    try:
        yield
    finally:
        _access_token.reset(token_reset)
        _user_email.reset(email_reset)
