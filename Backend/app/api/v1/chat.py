from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.chat import ChatMessage, ChatSession
from app.models.user import User
from app.schemas.chat import (
    ChatMessageCreate,
    ChatMessageResponse,
    ChatSessionCreate,
    ChatSessionResponse,
    ChatSessionWithMessages,
)

router = APIRouter(prefix="/chats", tags=["chat"])


@router.post("/sessions", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    payload: ChatSessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ChatSessionResponse:
    session = ChatSession(user_id=current_user.id, title=payload.title)
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return ChatSessionResponse.model_validate(session)


@router.get("/sessions", response_model=list[ChatSessionResponse])
async def list_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ChatSessionResponse]:
    result = await db.execute(
        select(ChatSession).where(ChatSession.user_id == current_user.id).order_by(ChatSession.updated_at.desc())
    )
    return [ChatSessionResponse.model_validate(row) for row in result.scalars().all()]


@router.get("/sessions/{session_id}", response_model=ChatSessionWithMessages)
async def get_session(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ChatSessionWithMessages:
    result = await db.execute(
        select(ChatSession)
        .options(selectinload(ChatSession.messages))
        .where(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
    )
    session = result.scalar_one_or_none()
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    return ChatSessionWithMessages.model_validate(session)


@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
async def create_message(
    session_id: UUID,
    payload: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ChatMessageResponse:
    result = await db.execute(
        select(ChatSession).where(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
    )
    session = result.scalar_one_or_none()
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    message = ChatMessage(
        session_id=session.id,
        role=payload.role,
        content=payload.content,
        extra_data=payload.extra_data,
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return ChatMessageResponse.model_validate(message)


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(
        select(ChatSession).where(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
    )
    session = result.scalar_one_or_none()
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    await db.delete(session)
    await db.commit()
