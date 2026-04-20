import os

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

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
