from fastapi import APIRouter, Depends

from app.core.security import get_current_user

router = APIRouter()


@router.get("/exchange")
def exchange(user: dict = Depends(get_current_user)):
    return {"user_id": user.get("sub")}
