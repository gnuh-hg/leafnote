import asyncio
import logging
import sys
import traceback
import os
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
        print("DEBUG: Starting database migrations...", flush=True)
        print(f"DEBUG: Current Working Directory: {os.getcwd()}", flush=True)
        print(f"DEBUG: Files in CWD: {os.listdir()}", flush=True)
        
        ini_path = "alembic.ini"
        if not os.path.exists(ini_path):
            print(f"ERROR: {ini_path} not found!", flush=True)
            sys.exit(3)
            
        alembic_cfg = Config(ini_path)
        command.upgrade(alembic_cfg, "head")
        print("DEBUG: Database migrations completed successfully.", flush=True)
    except Exception as e:
        print(f"CRITICAL ERROR: Migration failed: {e}", flush=True)
        traceback.print_exc(file=sys.stdout)
        sys.stdout.flush()
        # Give Render time to collect logs
        import time
        time.sleep(10)
        # Exit with a specific code to indicate migration failure
        sys.exit(3)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("DEBUG: Running lifespan startup tasks...", flush=True)
    loop = asyncio.get_event_loop()
    try:
        await loop.run_in_executor(None, _run_migrations)
    except SystemExit as e:
        print(f"DEBUG: SystemExit caught in lifespan: {e.code}", flush=True)
        raise e
    except Exception as e:
        print(f"DEBUG: Error in lifespan startup: {e}", flush=True)
        traceback.print_exc(file=sys.stdout)
        sys.stdout.flush()
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
