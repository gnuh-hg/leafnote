import asyncio
import logging
import sys
import traceback
from contextlib import asynccontextmanager

from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def _run_migrations() -> None:
    try:
        logger.info("Starting database migrations...")
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
        logger.info("Database migrations completed successfully.")
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        traceback.print_exc()
        # Exit with a specific code to indicate migration failure
        sys.exit(3)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Running lifespan startup tasks...")
    loop = asyncio.get_event_loop()
    try:
        await loop.run_in_executor(None, _run_migrations)
    except SystemExit as e:
        # Re-raise SystemExit to ensure the app stops if migrations fail
        raise e
    except Exception as e:
        logger.error(f"Error in lifespan startup: {e}")
        traceback.print_exc()
        raise e
    yield


app = FastAPI(title="Leafnote API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.api_route("/health", methods=["GET", "HEAD"])
def health():
    return {"status": "ok"}
