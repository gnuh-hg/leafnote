from fastapi import APIRouter

from app.api.v1.routes import auth, me

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(me.router, prefix="/me", tags=["me"])
