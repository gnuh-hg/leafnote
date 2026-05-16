from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


DocumentType = Literal[
    "theory", "narrative", "procedure", "reference", "meeting", "freeform"
]
DOCUMENT_TYPES: tuple[DocumentType, ...] = (
    "theory", "narrative", "procedure", "reference", "meeting", "freeform"
)


class NoteCreate(BaseModel):
    title: str = Field(default="", max_length=500)
    body: str = Field(default="")
    tag_ids: list[UUID] = Field(default_factory=list)
    document_type: DocumentType = "theory"


class NoteUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=500)
    body: str | None = None
    tag_ids: list[UUID] | None = None
    document_type: DocumentType | None = None


class NoteListItem(BaseModel):
    id: UUID
    title: str
    excerpt: str
    tag_ids: list[UUID]
    document_type: DocumentType
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NoteOut(BaseModel):
    id: UUID
    title: str
    body: str
    tag_ids: list[UUID]
    excerpt: str
    document_type: DocumentType
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
