from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ChatSessionCreate(BaseModel):
    title: str = Field(default="New Chat", min_length=1, max_length=255)


class ChatSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    title: str
    extra_data: dict
    created_at: datetime
    updated_at: datetime


class ChatMessageCreate(BaseModel):
    role: str = Field(pattern="^(user|assistant|system)$")
    content: str = Field(min_length=1)
    extra_data: dict = Field(default_factory=dict)


class ChatMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    session_id: UUID
    role: str
    content: str
    extra_data: dict
    created_at: datetime


class ChatSessionWithMessages(ChatSessionResponse):
    messages: list[ChatMessageResponse] = Field(default_factory=list)
