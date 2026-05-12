# Backend Patterns — Leafnote FastAPI

> Tài liệu tham khảo nội bộ cho FastAPI + SQLAlchemy async. Đọc khi viết endpoints, services, hoặc database queries.

## Service Layer Pattern (Mandatory)

```python
# app/services/notes.py — ALL business logic here
class NoteService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_user_notes(self, user_id: int, limit: int = 20, offset: int = 0) -> list[Note]:
        result = await self.session.execute(
            select(Note)
            .where(Note.user_id == user_id)
            .order_by(Note.updated_at.desc())
            .limit(limit).offset(offset)
        )
        return result.scalars().all()

    async def create_note(self, user_id: int, data: NoteCreate) -> Note:
        note = Note(user_id=user_id, **data.model_dump())
        self.session.add(note)
        await self.session.commit()
        await self.session.refresh(note)
        return note
```

```python
# app/api/v1/routes/notes.py — thin route, no logic
@router.get("/notes", response_model=list[NoteOut])
async def list_notes(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    service = NoteService(session)
    return await service.get_user_notes(current_user.id, limit, offset)
```

## SQLAlchemy Async — Common Patterns

```python
# Get one or 404
result = await session.execute(select(Note).where(Note.id == note_id, Note.user_id == user_id))
note = result.scalar_one_or_none()
if not note:
    raise HTTPException(status_code=404, detail="Note not found")

# Eager load relationship (NEVER lazy load in async)
result = await session.execute(
    select(Note)
    .where(Note.user_id == user_id)
    .options(selectinload(Note.tags))  # not lazy!
)
notes = result.scalars().all()

# Bulk update
await session.execute(
    update(Note).where(Note.user_id == user_id).values(is_archived=True)
)
await session.commit()
```

## Pydantic v2 Schemas

```python
# app/schemas/notes.py
from pydantic import BaseModel, Field
from datetime import datetime

class NoteCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(default="")

class NoteOut(BaseModel):
    id: int
    title: str
    content: str
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}  # Pydantic v2 (not orm_mode)
```

## Error Handling in Routes

```python
from fastapi import HTTPException

# Standard error responses
raise HTTPException(status_code=404, detail="Note not found")
raise HTTPException(status_code=403, detail="Not authorized")
raise HTTPException(status_code=409, detail="Note already exists")

# Never leak internal errors:
try:
    result = await service.create_note(...)
except IntegrityError:
    raise HTTPException(status_code=409, detail="Duplicate entry")
# NOT: raise HTTPException(detail=str(e))  — exposes internals
```

## Auth Dependency

```python
# Always on protected routes:
from app.core.auth import get_current_user

@router.delete("/notes/{note_id}")
async def delete_note(
    note_id: int,
    current_user: User = Depends(get_current_user),  # required
    session: AsyncSession = Depends(get_db),
):
    ...
```

## Config Pattern

```python
# ALWAYS via config, never os.environ directly
from app.core.config import settings

# Use: settings.DATABASE_URL, settings.SUPABASE_JWT_SECRET
# NEVER: os.environ["DATABASE_URL"] in routes or services
```
