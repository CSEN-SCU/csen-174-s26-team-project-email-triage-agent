import os

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str | None = Field(
        default=None,
        validation_alias=AliasChoices("DATABASE_URL", "TEST_DATABASE_URL"),
    )
    anthropic_api_key: str = ""
    claude_api_key: str = ""  # alias accepted for convenience
    triage_model: str = "claude-sonnet-4-5"
    classify_model: str = "claude-haiku-4-5"
    cors_origins: str = "http://localhost:3000"

    @property
    def api_key(self) -> str:
        return (
            self.anthropic_api_key
            or self.claude_api_key
            or os.environ.get("ANTHROPIC_API_KEY", "")
            or os.environ.get("CLAUDE_API_KEY", "")
        )

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()


def set_database_url(url: str | None) -> None:
    """Set the process-wide DB URL (e.g. tests). Empty string becomes None."""
    settings.database_url = url.strip() if url and url.strip() else None


def bind_database_url_from_environ() -> None:
    """Copy DATABASE_URL or TEST_DATABASE_URL from the environment onto ``settings``."""
    raw = (
        os.environ.get("DATABASE_URL", "").strip()
        or os.environ.get("TEST_DATABASE_URL", "").strip()
    )
    set_database_url(raw or None)
