from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user_id
from app.core.database import get_db
from app.schemas.note import NoteCreate, NoteListItem, NoteOut, NoteUpdate
from app.services import notes as note_service

router = APIRouter()


@router.get("", response_model=list[NoteListItem])
async def list_notes(
    tag_id: list[UUID] = Query(default_factory=list),
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    return await note_service.list_notes(db, user_id, tag_id or None)


@router.get("/{note_id}", response_model=NoteOut)
async def get_note(
    note_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    return await note_service.get_note(db, user_id, note_id)


@router.post("", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
async def create_note(
    data: NoteCreate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    return await note_service.create_note(db, user_id, data)


@router.patch("/{note_id}", response_model=NoteOut)
async def update_note(
    note_id: UUID,
    data: NoteUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    return await note_service.update_note(db, user_id, note_id, data)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    await note_service.delete_note(db, user_id, note_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
