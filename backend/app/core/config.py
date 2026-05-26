"""
Application configuration loaded from environment variables.

Uses Pydantic BaseSettings for type-safe configuration management
with automatic .env file loading.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "techboy_ai"

    # JWT Authentication
    JWT_SECRET: str = "change-this-secret-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 1440  # 24 hours

    # Google Gemini AI
    GEMINI_API_KEY: str = ""

    # Gmail Integration
    GMAIL_CREDENTIALS_PATH: str = "credentials.json"

    # Telegram Integration
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHAT_ID: str = ""

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origins(self) -> list[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


@lru_cache()
def get_settings() -> Settings:
    """
    Return a cached Settings instance.

    Uses lru_cache to ensure the settings are only loaded once
    from environment variables and .env file.
    """
    return Settings()
