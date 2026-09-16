from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Kriyanto Backend"
    app_version: str = "1.0.0"
    api_v1_prefix: str = "/api/v1"
    environment: str = "development"
    debug: bool = True

    database_url: str = Field(
        default="postgresql+psycopg://postgres:postgres@localhost:5432/kriyanto",
        description="PostgreSQL DSN",
    )

    jwt_secret_key: str = "change-me-in-production"
    jwt_refresh_secret_key: str = "change-me-too"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    password_reset_otp_expire_minutes: int = 10

    mail_username: str = ""
    mail_password: str = ""
    mail_from: str = ""
    mail_port: int = 587
    mail_server: str = ""
    mail_starttls: bool = True
    mail_ssl_tls: bool = False
    mail_validate_certs: bool = True

    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    python_rag_internal_url: str = Field(
        default="http://localhost:8001/api/v1",
        description="Internal URL of the Python RAG engine",
    )

@lru_cache
def get_settings() -> Settings:
    return Settings()
