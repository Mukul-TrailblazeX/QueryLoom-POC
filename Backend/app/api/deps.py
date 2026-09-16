from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token, is_jwt_error
from app.db.session import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(token)
        if payload.get("type") != "access":
            raise credentials_exception
        user_id = payload.get("sub")
        if not user_id:
            raise credentials_exception
        uuid_user_id = UUID(user_id)
    except Exception as exc:
        if is_jwt_error(exc) or isinstance(exc, ValueError):
            raise credentials_exception from exc
        raise

    result = await db.execute(select(User).where(User.id == uuid_user_id, User.is_active.is_(True)))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user
