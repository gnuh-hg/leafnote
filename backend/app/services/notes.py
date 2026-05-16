from typing import Any
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.note import Note
from app.models.tag import Tag
from app.schemas.note import NoteCreate, NoteUpdate


EXCERPT_LEN = 200


def _serialize(note: Note) -> dict[str, Any]:
    return {
        "id": note.id,
        "title": note.title,
        "body": note.body,
        "tag_ids": [t.id for t in note.tags],
        "excerpt": note.body[:EXCERPT_LEN],
        "document_type": note.document_type,
        "created_at": note.created_at,
        "updated_at": note.updated_at,
    }


async def _load_tags(db: AsyncSession, user_id: UUID, tag_ids: list[UUID]) -> list[Tag]:
    if not tag_ids:
        return []
    result = await db.execute(
        select(Tag).where(Tag.user_id == user_id, Tag.id.in_(tag_ids))
    )
    tags = list(result.scalars().all())
    if len(tags) != len(set(tag_ids)):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid tag_ids")
    return tags


async def list_notes(
    db: AsyncSession, user_id: UUID, tag_ids: list[UUID] | None = None
) -> list[dict[str, Any]]:
    stmt = (
        select(Note)
        .where(Note.user_id == user_id)
        .options(selectinload(Note.tags))
        .order_by(Note.updated_at.desc())
    )
    if tag_ids:
        for tag_id in tag_ids:
            stmt = stmt.where(Note.tags.any(Tag.id == tag_id))
    result = await db.execute(stmt)
    return [_serialize(n) for n in result.scalars().unique().all()]


async def get_note(db: AsyncSession, user_id: UUID, note_id: UUID) -> dict[str, Any]:
    note = await db.get(Note, note_id, options=[selectinload(Note.tags)])
    if not note or note.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return _serialize(note)


async def create_note(
    db: AsyncSession, user_id: UUID, data: NoteCreate
) -> dict[str, Any]:
    tags = await _load_tags(db, user_id, data.tag_ids)
    note = Note(
        user_id=user_id,
        title=data.title,
        body=data.body,
        plain_text=data.body,
        document_type=data.document_type,
        tags=tags,
    )
    db.add(note)
    await db.commit()
    await db.refresh(note, attribute_names=["tags"])
    return _serialize(note)


async def update_note(
    db: AsyncSession, user_id: UUID, note_id: UUID, data: NoteUpdate
) -> dict[str, Any]:
    note = await db.get(Note, note_id, options=[selectinload(Note.tags)])
    if not note or note.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    payload = data.model_dump(exclude_unset=True)
    if "title" in payload and payload["title"] is not None:
        note.title = payload["title"]
    if "body" in payload and payload["body"] is not None:
        note.body = payload["body"]
        note.plain_text = payload["body"]
    if "tag_ids" in payload and payload["tag_ids"] is not None:
        note.tags = await _load_tags(db, user_id, payload["tag_ids"])
    if "document_type" in payload and payload["document_type"] is not None:
        note.document_type = payload["document_type"]

    await db.commit()
    await db.refresh(note, attribute_names=["tags"])
    return _serialize(note)


async def delete_note(db: AsyncSession, user_id: UUID, note_id: UUID) -> None:
    note = await db.get(Note, note_id)
    if not note or note.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    await db.delete(note)
    await db.commit()
