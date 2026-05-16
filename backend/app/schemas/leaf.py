from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


LeafType = Literal["definition", "fact", "example", "question", "note"]
LEAF_TYPES: tuple[LeafType, ...] = ("definition", "fact", "example", "question", "note")


class LeafEngineItem(BaseModel):
    """Một leaf trả về từ engine — pre-validation, có thể bị reject."""

    type: LeafType
    content: str = Field(min_length=1, max_length=2000)
    metadata: dict[str, Any] = Field(default_factory=dict)
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)


class LeafUpdate(BaseModel):
    type: LeafType | None = None
    content: str | None = Field(default=None, min_length=1, max_length=2000)
    metadata: dict[str, Any] | None = None


class LeafFeedback(BaseModel):
    rating: Literal["up", "down"]


class LeafOut(BaseModel):
    id: UUID
    note_id: UUID
    type: LeafType
    content: str
    metadata: dict[str, Any]
    confidence: float
    user_edited: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QualityReport(BaseModel):
    coverage: float
    atomicity: float
    no_duplicate: float
    type_valid: float
    granularity_floor: float
    total: float
    issues: list[str] = Field(default_factory=list)


class RegenerateResponse(BaseModel):
    leaves: list[LeafOut]
    quality: QualityReport
    retried: bool
