from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.auth import UserUpdate


async def get_or_create_user(
    db: AsyncSession, supabase_user_id: UUID, email: str
) -> User:
    result = await db.execute(select(User).where(User.id == supabase_user_id))
    user = result.scalar_one_or_none()

    if not user:
        user = User(id=supabase_user_id, email=email)
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user


async def update_user(db: AsyncSession, user: User, data: UserUpdate) -> User:
    if data.display_name is not None:
        user.display_name = data.display_name
    await db.commit()
    await db.refresh(user)
    return user
