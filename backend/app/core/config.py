import json
import sys
import time
import traceback

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

print("DEBUG: Starting config.py module loading...", flush=True)

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ENVIRONMENT: str = "development"

    DATABASE_URL: str
    DATABASE_POOLER_URL: str = ""

    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str

    REDIS_URL: str = "redis://localhost:6379"

    SECRET_KEY: str

    SUPABASE_JWT_SECRET: str

    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

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

print("DEBUG: Attempting to instantiate Settings class...", flush=True)

try:
    settings = Settings()
    print("DEBUG: Settings instantiated successfully.", flush=True)
except Exception as e:
    print(f"CRITICAL CONFIG ERROR: Pydantic validation failed!", flush=True)
    print(f"ERROR DETAILS: {e}", flush=True)
    traceback.print_exc(file=sys.stdout)
    sys.stdout.flush()
    # Wait to ensure Render captures the logs
    time.sleep(10)
    sys.exit(3)
