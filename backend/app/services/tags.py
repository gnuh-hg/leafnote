from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tag import Tag
from app.schemas.tag import TagCreate, TagUpdate


async def list_tags(db: AsyncSession, user_id: UUID) -> list[Tag]:
    result = await db.execute(
        select(Tag)
        .where(Tag.user_id == user_id)
        .order_by(Tag.access_count.desc(), Tag.created_at.desc())
    )
    return list(result.scalars().all())


async def create_tag(db: AsyncSession, user_id: UUID, data: TagCreate) -> Tag:
    existing = await db.execute(
        select(Tag).where(Tag.user_id == user_id, Tag.name == data.name)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Tag '{data.name}' already exists",
        )

    tag = Tag(user_id=user_id, **data.model_dump())
    db.add(tag)
    await db.commit()
    await db.refresh(tag)
    return tag


async def update_tag(
    db: AsyncSession, user_id: UUID, tag_id: UUID, data: TagUpdate
) -> Tag:
    tag = await db.get(Tag, tag_id)
    if not tag or tag.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")

    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        return tag

    if "name" in update_data:
        dup = await db.execute(
            select(Tag).where(
                Tag.user_id == user_id,
                Tag.name == update_data["name"],
                Tag.id != tag_id,
            )
        )
        if dup.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Tag '{update_data['name']}' already exists",
            )

    for key, value in update_data.items():
        setattr(tag, key, value)

    await db.commit()
    await db.refresh(tag)
    return tag


async def delete_tag(db: AsyncSession, user_id: UUID, tag_id: UUID) -> None:
    tag = await db.get(Tag, tag_id)
    if not tag or tag.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")

    await db.delete(tag)
    await db.commit()


async def track_access(db: AsyncSession, user_id: UUID, tag_id: UUID) -> None:
    tag = await db.get(Tag, tag_id)
    if not tag or tag.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")

    tag.access_count += 1
    tag.last_accessed = datetime.now(timezone.utc)
    await db.commit()
