from uuid import UUID

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user_id
from app.core.database import get_db
from app.schemas.tag import TagCreate, TagOut, TagUpdate
from app.services import tags as tag_service

router = APIRouter()


@router.get("", response_model=list[TagOut])
async def list_tags(
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    return await tag_service.list_tags(db, user_id)


@router.post("", response_model=TagOut, status_code=status.HTTP_201_CREATED)
async def create_tag(
    data: TagCreate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    return await tag_service.create_tag(db, user_id, data)


@router.patch("/{tag_id}", response_model=TagOut)
async def update_tag(
    tag_id: UUID,
    data: TagUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    return await tag_service.update_tag(db, user_id, tag_id, data)


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    tag_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    await tag_service.delete_tag(db, user_id, tag_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{tag_id}/access", status_code=status.HTTP_204_NO_CONTENT)
async def track_tag_access(
    tag_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    await tag_service.track_access(db, user_id, tag_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
