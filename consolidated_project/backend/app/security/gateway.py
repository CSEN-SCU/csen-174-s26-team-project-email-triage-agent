"""Shared-secret gateway check.

The only legitimate caller of this backend is the frontend proxy
(`frontend/app/api/[...path]/route.ts` on Vercel), which injects an
`x-gateway-key` header on every forwarded request. The backend rejects
any request that does not present the configured secret.

Network-level allowlisting is not possible here (the proxy runs on
Vercel's rotating egress IPs), so this application-layer secret is the
actual access control. It sits in front of the per-user Gmail OAuth
token, which remains the second layer.

If ``GATEWAY_KEY`` is unset (e.g. local development), enforcement is
disabled so the app runs without the secret.
"""

import hmac

from fastapi import Header, HTTPException, status

from app.config import settings


def require_gateway_key(
    x_gateway_key: str | None = Header(default=None),
) -> None:
    expected = settings.gateway_key
    if not expected:
        return  # enforcement disabled when no key is configured
    if not x_gateway_key or not hmac.compare_digest(x_gateway_key, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid or missing gateway key",
        )
