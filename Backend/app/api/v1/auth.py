from datetime import UTC, datetime, timedelta
from random import SystemRandom
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.security import decode_refresh_token, hash_password, is_jwt_error, verify_password
from app.db.session import get_db
from app.models.password_reset import PasswordResetOTP
from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    ForgotPasswordRequest,
    RefreshTokenRequest,
    ResetPasswordRequest,
    UserCreate,
    UserLogin,
    UserResponse,
)
from app.services.auth_service import build_token_pair
from app.services.mail_service import send_password_reset_otp

settings = get_settings()
router = APIRouter(prefix="/auth", tags=["auth"])
_rng = SystemRandom()


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)) -> AuthResponse:
    existing = await db.execute(select(User).where(User.email == payload.email.lower()))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")

    user = User(
        full_name=payload.full_name.strip(),
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return AuthResponse(user=UserResponse.model_validate(user), tokens=build_token_pair(str(user.id)))


@router.post("/login", response_model=AuthResponse)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)) -> AuthResponse:
    result = await db.execute(select(User).where(User.email == payload.email.lower()))
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    return AuthResponse(user=UserResponse.model_validate(user), tokens=build_token_pair(str(user.id)))


@router.post("/refresh", response_model=dict)
async def refresh_tokens(payload: RefreshTokenRequest) -> dict:
    try:
        decoded = decode_refresh_token(payload.refresh_token)
        if decoded.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
        user_id = decoded.get("sub")
        UUID(user_id)
    except Exception as exc:
        if isinstance(exc, HTTPException):
            raise
        if is_jwt_error(exc) or isinstance(exc, ValueError):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token") from exc
        raise

    return build_token_pair(user_id).model_dump()


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.post("/forgot-password", response_model=dict)
async def forgot_password(payload: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)) -> dict:
    email = payload.email.lower()
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    # Always return generic response for security and account enumeration protection.
    generic_message = {"message": "If the account exists, a password reset OTP has been sent."}
    if not user:
        return generic_message

    now = datetime.now(UTC)
    otp_code = f"{_rng.randrange(0, 1_000_000):06d}"
    expires_at = now + timedelta(minutes=settings.password_reset_otp_expire_minutes)

    await db.execute(
        update(PasswordResetOTP)
        .where(PasswordResetOTP.user_id == user.id, PasswordResetOTP.used_at.is_(None), PasswordResetOTP.expires_at > now)
        .values(used_at=now)
    )

    otp_record = PasswordResetOTP(user_id=user.id, otp_code=otp_code, expires_at=expires_at)
    db.add(otp_record)
    await db.commit()

    try:
        await send_password_reset_otp(
            email=user.email,
            full_name=user.full_name,
            otp_code=otp_code,
            expiry_minutes=settings.password_reset_otp_expire_minutes,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send reset email. Please try again.",
        ) from exc

    return generic_message


@router.post("/reset-password", response_model=dict)
async def reset_password(payload: ResetPasswordRequest, db: AsyncSession = Depends(get_db)) -> dict:
    email = payload.email.lower()
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP or email")

    now = datetime.now(UTC)
    otp_result = await db.execute(
        select(PasswordResetOTP)
        .where(
            PasswordResetOTP.user_id == user.id,
            PasswordResetOTP.otp_code == payload.otp,
            PasswordResetOTP.used_at.is_(None),
            PasswordResetOTP.expires_at > now,
        )
        .order_by(PasswordResetOTP.created_at.desc())
    )
    otp_record = otp_result.scalars().first()
    if not otp_record:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP or email")

    user.password_hash = hash_password(payload.new_password)
    otp_record.used_at = now
    await db.commit()

    return {"message": "Password has been reset successfully."}
