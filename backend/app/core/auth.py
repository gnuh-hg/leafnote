import time
from uuid import UUID

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwk, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.services import auth as auth_service

security = HTTPBearer()

_JWKS_TTL_SECONDS = 600
_jwks_cache: dict | None = None
_jwks_fetched_at: float = 0.0


async def _get_jwks(force_refresh: bool = False) -> dict:
    global _jwks_cache, _jwks_fetched_at
    now = time.monotonic()
    if (
        force_refresh
        or _jwks_cache is None
        or now - _jwks_fetched_at > _JWKS_TTL_SECONDS
    ):
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json",
                timeout=10,
            )
            resp.raise_for_status()
            _jwks_cache = resp.json()
            _jwks_fetched_at = now
    return _jwks_cache


def _find_key(jwks: dict, kid: str | None) -> dict | None:
    if not kid:
        return None
    return next((k for k in jwks.get("keys", []) if k.get("kid") == kid), None)


async def _verify_jwt(token: str) -> dict:
    issuer = f"{settings.SUPABASE_URL}/auth/v1"
    header = jwt.get_unverified_header(token)
    alg = header.get("alg", "HS256")

    if alg == "ES256":
        kid = header.get("kid")
        jwks = await _get_jwks()
        key_data = _find_key(jwks, kid)
        if key_data is None:
            jwks = await _get_jwks(force_refresh=True)
            key_data = _find_key(jwks, kid)
        if key_data is None:
            raise JWTError("Unknown signing key")
        return jwt.decode(
            token,
            jwk.construct(key_data),
            algorithms=["ES256"],
            audience="authenticated",
            issuer=issuer,
        )
    if alg == "HS256":
        return jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
            issuer=issuer,
        )
    raise JWTError(f"Unsupported alg: {alg}")


# In-memory cache of users known to have a row in the DB. Lets hot paths
# skip the SELECT-or-INSERT round-trip after the first request per user.
# Process-local; warms naturally per worker.
_known_user_ids: set[UUID] = set()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> UUID:
    try:
        payload = await _verify_jwt(credentials.credentials)
        user_id = UUID(payload["sub"])
        email = payload.get("email", "")
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    if user_id not in _known_user_ids:
        await auth_service.get_or_create_user(db, user_id, email)
        _known_user_ids.add(user_id)
    return user_id


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    try:
        payload = await _verify_jwt(credentials.credentials)
        user_id = UUID(payload["sub"])
        email = payload.get("email", "")
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    user = await auth_service.get_or_create_user(db, user_id, email)
    _known_user_ids.add(user_id)
    return user
