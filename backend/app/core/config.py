import json

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ENVIRONMENT: str = "development"

    DATABASE_URL: str
    DATABASE_DIRECT_URL: str

    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_JWT_SECRET: str

    REDIS_URL: str = "redis://localhost:6379"

    SECRET_KEY: str

    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    LEAF_ENGINE_URL: str = ""
    LEAF_ENGINE_API_KEY: str = ""
    LEAF_ENGINE_MODEL: str = ""
    LEAF_ENGINE_TIMEOUT_S: float = 60.0
    LEAF_QUALITY_MIN_SCORE: float = 0.75

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: object) -> list[str]:
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except json.JSONDecodeError:
                pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v


settings = Settings()
