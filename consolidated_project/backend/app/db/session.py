from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import settings

_last_async_url: str | None = None
_async_engine: AsyncEngine | None = None
_async_session_factory: async_sessionmaker[AsyncSession] | None = None


def _database_url() -> str | None:
    u = settings.database_url
    return u.strip() if u and u.strip() else None


def _to_asyncpg_url(url: str) -> str:
    u = url.strip()
    if u.startswith("postgresql+asyncpg://"):
        return u
    if u.startswith("postgres://"):
        return "postgresql+asyncpg://" + u[len("postgres://") :]
    if u.startswith("postgresql://"):
        return "postgresql+asyncpg://" + u[len("postgresql://") :]
    return u


def get_async_engine() -> AsyncEngine | None:
    global _last_async_url, _async_engine, _async_session_factory
    url = _database_url()
    if not url:
        _last_async_url = None
        _async_engine = None
        _async_session_factory = None
        return None
    async_url = _to_asyncpg_url(url)
    if async_url != _last_async_url:
        _last_async_url = async_url
        _async_engine = create_async_engine(async_url, pool_pre_ping=True)
        _async_session_factory = async_sessionmaker(
            _async_engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )
    return _async_engine


def get_async_session_factory() -> async_sessionmaker[AsyncSession] | None:
    get_async_engine()
    return _async_session_factory


async def dispose_async_engine() -> None:
    global _last_async_url, _async_engine, _async_session_factory
    if _async_engine is not None:
        await _async_engine.dispose()
    _last_async_url = None
    _async_engine = None
    _async_session_factory = None
