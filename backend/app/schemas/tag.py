from datetime import datetime
from typing import Annotated, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

VALID_COLORS = {"amber", "emerald", "sky", "teal", "rose", "violet", "orange", "indigo"}


def _normalize_name(v: str) -> str:
    return v.strip().lower().replace(" ", "-")


class TagCreate(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=50)]
    color: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = _normalize_name(v)
        if not v:
            raise ValueError("name must be 1-50 characters")
        return v

    @field_validator("color")
    @classmethod
    def validate_color(cls, v: str) -> str:
        if v not in VALID_COLORS:
            raise ValueError(f"color must be one of {VALID_COLORS}")
        return v


class TagUpdate(BaseModel):
    name: Optional[Annotated[str, Field(min_length=1, max_length=50)]] = None
    color: Optional[str] = None

    @field_validator("name", mode="before")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = _normalize_name(str(v))
        if not v:
            raise ValueError("name must be 1-50 characters")
        return v

    @field_validator("color", mode="before")
    @classmethod
    def validate_color(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_COLORS:
            raise ValueError(f"color must be one of {VALID_COLORS}")
        return v


class TagOut(BaseModel):
    id: UUID
    name: str
    color: str
    note_count: int = 0
    access_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
