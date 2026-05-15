from fastapi import APIRouter

from app.api.v1.routes.auth import router as auth_router
from app.api.v1.routes.notes import router as notes_router
from app.api.v1.routes.tags import router as tags_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(tags_router, prefix="/tags")
api_router.include_router(notes_router, prefix="/notes")
