from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class LeafFeedback(Base):
    __tablename__ = "leaf_feedback"
    __table_args__ = (
        Index("ix_leaf_feedback_leaf_id", "leaf_id"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    leaf_id: Mapped[UUID] = mapped_column(
        ForeignKey("leaves.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    rating: Mapped[str] = mapped_column(String(8), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
