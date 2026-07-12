"""
Application configuration via Pydantic BaseSettings.
All secrets and tunables live here — never scattered across modules.
"""

from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # AI provider (OpenAI-compatible interface)
    ai_api_key:      Optional[str] = None
    ai_model:        str           = "gpt-4o-mini"
    ai_base_url:     str           = "https://api.openai.com/v1"
    ai_timeout_secs: int           = 15

    # Upload constraints
    max_file_size_bytes: int = 1_000_000   # 1 MB
    max_files_per_request: int = 5

    # Scoring thresholds
    score_critical_penalty: int = 25
    score_high_penalty:     int = 15
    score_medium_penalty:   int = 8
    score_low_penalty:      int = 3

    # CORS — extend in Phase 2
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    """Cached singleton — call this everywhere instead of Settings()."""
    return Settings()
