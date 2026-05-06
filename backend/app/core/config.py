from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ENVIRONMENT: str = "development"

    DATABASE_URL: str
    DATABASE_POOLER_URL: str = ""

    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str

    REDIS_URL: str = "redis://localhost:6379"

    SECRET_KEY: str

    CORS_ORIGINS: list[str] = ["http://localhost:5173"]


settings = Settings()
