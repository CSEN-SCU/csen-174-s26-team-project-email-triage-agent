"""In-memory per-identity rate limiter.

Keyed by a stable hash of the user's Google OAuth access token when present
(so the same signed-in user is one bucket regardless of IP), falling back to
the client IP for unauthenticated requests. Two limiters are exposed:

- `rate_limit_default` — light cap for read endpoints
- `rate_limit_triage`  — tighter cap for the LLM-bound triage endpoints

This is a process-local sliding window.
"""

from __future__ import annotations

import hashlib
import threading
import time
from collections import defaultdict, deque
from typing import Deque

from fastapi import Depends, HTTPException, Request, status

from app.auth.deps import gmail_access_token


def _identity_from(token: str | None, request: Request) -> str:
    if token:
        digest = hashlib.sha256(token.encode("utf-8")).hexdigest()[:32]
        return f"user:{digest}"
    client = request.client
    return f"ip:{client.host if client else 'unknown'}"


class SlidingWindowLimiter:
    def __init__(self, max_requests: int, window_seconds: float) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: dict[str, Deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def check(self, identity: str) -> None:
        now = time.monotonic()
        cutoff = now - self.window_seconds
        with self._lock:
            bucket = self._hits[identity]
            while bucket and bucket[0] < cutoff:
                bucket.popleft()
            if len(bucket) >= self.max_requests:
                retry_after = max(1, int(self.window_seconds - (now - bucket[0])))
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"rate limit exceeded for {identity.split(':', 1)[0]}",
                    headers={"Retry-After": str(retry_after)},
                )
            bucket.append(now)


_default_limiter = SlidingWindowLimiter(max_requests=120, window_seconds=60.0)
_triage_limiter = SlidingWindowLimiter(max_requests=10, window_seconds=60.0)


def rate_limit_default(
    request: Request,
    token: str | None = Depends(gmail_access_token),
) -> str:
    identity = _identity_from(token, request)
    _default_limiter.check(identity)
    return identity


def rate_limit_triage(
    request: Request,
    token: str | None = Depends(gmail_access_token),
) -> str:
    identity = _identity_from(token, request)
    _triage_limiter.check(identity)
    return identity
