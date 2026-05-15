import uuid

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


# Supabase Transaction Pooler (pgbouncer transaction mode) rotates the
# server backend per transaction. To stay compatible with pool reuse:
#
# 1. `statement_cache_size=0` + `prepared_statement_cache_size=0` — asyncpg
#    never caches prepared statements across transactions, so a rotated
#    backend never sees a stale prepare reference.
# 2. `prepared_statement_name_func` gives any per-query prepare a unique
#    name as a belt-and-suspenders guard against server-side collisions.
# 3. `pool_pre_ping` drops dead connections silently dropped by pgbouncer
#    instead of surfacing as request errors.
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_size=10,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=1800,
    connect_args={
        "ssl": "require",
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
        "prepared_statement_name_func": lambda: f"__asyncpg_{uuid.uuid4().hex}__",
        "server_settings": {
            "tcp_user_timeout": "10000",
        },
    },
)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        yield session
