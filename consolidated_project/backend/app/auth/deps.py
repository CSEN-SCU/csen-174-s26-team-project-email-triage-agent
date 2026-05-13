from fastapi import Header


async def gmail_access_token(
    authorization: str | None = Header(default=None),
) -> str | None:
    if not authorization:
        return None
    scheme, _, value = authorization.partition(" ")
    if scheme.lower() != "bearer":
        return None
    token = value.strip()
    return token or None
