from uuid import UUID

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user_id
from app.core.database import get_db
from app.schemas.leaf import LeafFeedback, LeafOut, LeafUpdate, RegenerateResponse
from app.services import leaves as leaf_service


# Routes split: per-note (regen + list) và per-leaf (CRUD + feedback).
note_router = APIRouter()
leaf_router = APIRouter()


@note_router.get("/{note_id}/leaves", response_model=list[LeafOut])
async def list_leaves_by_note(
    note_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    return await leaf_service.list_by_note(db, user_id, note_id)


@note_router.post("/{note_id}/leaves/regenerate", response_model=RegenerateResponse)
async def regenerate_leaves(
    note_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    return await leaf_service.regenerate_for_note(db, user_id, note_id)


@leaf_router.patch("/{leaf_id}", response_model=LeafOut)
async def update_leaf(
    leaf_id: UUID,
    data: LeafUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    return await leaf_service.update_leaf(db, user_id, leaf_id, data)


@leaf_router.delete("/{leaf_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_leaf(
    leaf_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    await leaf_service.delete_leaf(db, user_id, leaf_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@leaf_router.post("/{leaf_id}/feedback", status_code=status.HTTP_204_NO_CONTENT)
async def submit_feedback(
    leaf_id: UUID,
    data: LeafFeedback,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    await leaf_service.feedback(db, user_id, leaf_id, data.rating)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
