"""CRUD + regenerate orchestrator cho leaves."""
from __future__ import annotations

from typing import Any
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.leaf import Leaf
from app.models.leaf_feedback import LeafFeedback
from app.models.note import Note
from app.schemas.leaf import LeafEngineItem, LeafOut, LeafUpdate, QualityReport, RegenerateResponse
from app.services import leaf_engine, leaf_quality


def _serialize(leaf: Leaf) -> dict[str, Any]:
    return {
        "id": leaf.id,
        "note_id": leaf.note_id,
        "type": leaf.type,
        "content": leaf.content,
        "metadata": leaf.leaf_metadata or {},
        "confidence": leaf.confidence,
        "user_edited": leaf.user_edited,
        "created_at": leaf.created_at,
        "updated_at": leaf.updated_at,
    }


async def _get_note_owned(db: AsyncSession, user_id: UUID, note_id: UUID) -> Note:
    note = await db.get(Note, note_id)
    if not note or note.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return note


async def _get_leaf_owned(db: AsyncSession, user_id: UUID, leaf_id: UUID) -> Leaf:
    leaf = await db.get(Leaf, leaf_id)
    if not leaf or leaf.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leaf not found")
    return leaf


async def list_by_note(db: AsyncSession, user_id: UUID, note_id: UUID) -> list[dict[str, Any]]:
    await _get_note_owned(db, user_id, note_id)
    result = await db.execute(
        select(Leaf).where(Leaf.note_id == note_id).order_by(Leaf.created_at)
    )
    return [_serialize(l) for l in result.scalars().all()]


async def update_leaf(
    db: AsyncSession, user_id: UUID, leaf_id: UUID, data: LeafUpdate
) -> dict[str, Any]:
    leaf = await _get_leaf_owned(db, user_id, leaf_id)
    payload = data.model_dump(exclude_unset=True)
    if "type" in payload and payload["type"] is not None:
        leaf.type = payload["type"]
    if "content" in payload and payload["content"] is not None:
        leaf.content = payload["content"]
    if "metadata" in payload and payload["metadata"] is not None:
        leaf.leaf_metadata = payload["metadata"]
    leaf.user_edited = True
    await db.commit()
    await db.refresh(leaf)
    return _serialize(leaf)


async def delete_leaf(db: AsyncSession, user_id: UUID, leaf_id: UUID) -> None:
    leaf = await _get_leaf_owned(db, user_id, leaf_id)
    await db.delete(leaf)
    await db.commit()


async def feedback(
    db: AsyncSession, user_id: UUID, leaf_id: UUID, rating: str
) -> None:
    await _get_leaf_owned(db, user_id, leaf_id)
    db.add(LeafFeedback(leaf_id=leaf_id, user_id=user_id, rating=rating))
    await db.commit()


async def _replace_leaves(
    db: AsyncSession,
    user_id: UUID,
    note: Note,
    items: list[LeafEngineItem],
) -> list[Leaf]:
    """Xóa leaves chưa user_edited, chèn mới từ items.

    Leaves đã user_edited được giữ nguyên — không bị overwrite.
    """
    existing = await db.execute(
        select(Leaf).where(Leaf.note_id == note.id, Leaf.user_edited.is_(False))
    )
    for old in existing.scalars().all():
        await db.delete(old)
    await db.flush()

    new_leaves = [
        Leaf(
            note_id=note.id,
            user_id=user_id,
            type=item.type,
            content=item.content,
            leaf_metadata=item.metadata,
            confidence=item.confidence,
            user_edited=False,
        )
        for item in items
    ]
    for l in new_leaves:
        db.add(l)
    await db.commit()

    result = await db.execute(
        select(Leaf).where(Leaf.note_id == note.id).order_by(Leaf.created_at)
    )
    return list(result.scalars().all())


async def regenerate_for_note(
    db: AsyncSession, user_id: UUID, note_id: UUID
) -> RegenerateResponse:
    note = await _get_note_owned(db, user_id, note_id)

    # Freeform: short-circuit, vẫn replace để clear old leaves nếu doc_type vừa đổi.
    if note.document_type == "freeform":
        leaves = await _replace_leaves(db, user_id, note, [])
        return RegenerateResponse(
            leaves=[LeafOut.model_validate(_serialize(l)) for l in leaves],
            quality=QualityReport(
                coverage=0.0, atomicity=1.0, no_duplicate=1.0,
                type_valid=1.0, granularity_floor=1.0, total=0.0,
                issues=["freeform_skipped"],
            ),
            retried=False,
        )

    note_text = note.plain_text or note.body or ""
    if not note_text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Note is empty",
        )

    # Lần 1.
    items = await _safe_engine_call(note_text, note.document_type)
    report = leaf_quality.score(note_text, items)
    retried = False

    if not leaf_quality.passes(report, settings.LEAF_QUALITY_MIN_SCORE):
        # Retry 1 lần với hint.
        retried = True
        hint = leaf_quality.retry_hint(report)
        items = await _safe_engine_call(note_text, note.document_type, retry_hint=hint)
        report = leaf_quality.score(note_text, items)

        if not leaf_quality.passes(report, settings.LEAF_QUALITY_MIN_SCORE):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "message": "Leaf engine output below quality threshold",
                    "quality": report.model_dump(),
                    "raw_leaves": [i.model_dump() for i in items],
                },
            )

    leaves = await _replace_leaves(db, user_id, note, items)
    return RegenerateResponse(
        leaves=[LeafOut.model_validate(_serialize(l)) for l in leaves],
        quality=report,
        retried=retried,
    )


async def _safe_engine_call(
    note_text: str, document_type: str, *, retry_hint: str | None = None
) -> list[LeafEngineItem]:
    try:
        return await leaf_engine.split_note(
            note_text, document_type, retry_hint=retry_hint
        )
    except leaf_engine.LeafEngineError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Leaf engine unavailable: {exc}",
        )
