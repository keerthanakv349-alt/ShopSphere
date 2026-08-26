"""
Central application configuration.

All environment-specific configuration is loaded through pydantic-settings.
This keeps database URLs, JWT configuration, CORS settings, payment
configuration, and other secrets in one typed settings object.
"""

import sys

from pydantic import ValidationError
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ---------------------------------------------------------
    # Database
    # ---------------------------------------------------------
    DATABASE_URL: str

    # ---------------------------------------------------------
    # JWT / Authentication
    # ---------------------------------------------------------
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ---------------------------------------------------------
    # Application
    # ---------------------------------------------------------
    ENVIRONMENT: str = "development"

    CORS_ORIGINS: str = (
        "http://localhost:3000,"
        "http://127.0.0.1:3000"
    )

    # ---------------------------------------------------------
    # Razorpay
    # ---------------------------------------------------------
    #
    # These values are only required when using real Razorpay.
    # For local development we are using:
    #
    # PAYMENT_MODE=mock
    #
    RAZORPAY_KEY_ID: str = "rzp_test_placeholder_key_id"
    RAZORPAY_KEY_SECRET: str = (
        "placeholder_key_secret_change_in_production"
    )
    RAZORPAY_WEBHOOK_SECRET: str = (
        "placeholder_webhook_secret_change_in_production"
    )

    # ---------------------------------------------------------
    # Payment Mode
    # ---------------------------------------------------------
    #
    # mock:
    #   Does not contact Razorpay.
    #
    # razorpay:
    #   Uses the real Razorpay integration.
    #
    PAYMENT_MODE: str = "mock"

    # ---------------------------------------------------------
    # Default Admin
    # ---------------------------------------------------------
    DEFAULT_ADMIN_EMAIL: str = "admin@shopsphere.com"
    DEFAULT_ADMIN_PASSWORD: str = "Admin@12345"
    DEFAULT_ADMIN_FULL_NAME: str = "ShopSphere Admin"


    
    # ---------------------------------------------------------
    # Pexels (stock photo fetch script — not used by the running app)
    # ---------------------------------------------------------
    PEXELS_API_KEY: str | None = None

    # ---------------------------------------------------------
    # Pydantic Settings Configuration
    # ---------------------------------------------------------
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.CORS_ORIGINS.split(",")
            if origin.strip()
        ]


def _load_settings() -> Settings:
    try:
        return Settings()

    except ValidationError as exc:
        missing = [
            str(error["loc"][0])
            for error in exc.errors()
            if error["type"] == "missing"
        ]

        print(
            "\n"
            "=== Configuration error: backend cannot start ===\n"
            f"Missing required environment variable(s): "
            f"{', '.join(missing) or '(see details below)'}\n"
            "\n"
            "Most likely cause: backend/.env is missing or incomplete.\n"
            "\n"
            "Fix:\n"
            "    cd backend\n"
            "    cp .env.example .env\n"
            "\n"
            "Then make sure DATABASE_URL and SECRET_KEY are configured.\n"
            "\n"
            f"Full validation error:\n{exc}\n"
            "===================================================\n",
            file=sys.stderr,
        )

        raise SystemExit(1) from exc


# Singleton settings instance.
#
# Other modules can use:
#
# from app.core.config import settings
#
settings = _load_settings()