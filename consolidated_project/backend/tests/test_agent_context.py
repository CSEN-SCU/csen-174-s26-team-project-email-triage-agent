import asyncio
import pytest
from app.agent import context as ctx


def test_get_access_token_is_none_by_default():
    assert ctx.get_access_token() is None


def test_request_context_sets_and_resets_token():
    assert ctx.get_access_token() is None
    with ctx.request_context("tok-123"):
        assert ctx.get_access_token() == "tok-123"
        ctx.set_user_email("seller@example.com")
        assert ctx.get_user_email() == "seller@example.com"
    assert ctx.get_access_token() is None
    assert ctx.get_user_email() is None


@pytest.mark.asyncio
async def test_token_does_not_leak_across_concurrent_tasks():
    seen: dict[str, str | None] = {}

    async def worker(name: str, token: str):
        with ctx.request_context(token):
            await asyncio.sleep(0.01)
            seen[name] = ctx.get_access_token()

    await asyncio.gather(worker("a", "tok-a"), worker("b", "tok-b"))
    assert seen == {"a": "tok-a", "b": "tok-b"}
