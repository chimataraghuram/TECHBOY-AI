"""Chat schemas – request/response models for chat endpoints."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ChatRequest(BaseModel):
    """Incoming chat message from the client."""

    message: str
    session_id: Optional[str] = None


class ChatMessageSchema(BaseModel):
    """A single message inside a chat session."""

    role: str
    text: str
    timestamp: datetime


class SessionResponse(BaseModel):
    """Full representation of a chat session (including messages)."""

    id: str
    session_id: str
    title: str
    messages: list[ChatMessageSchema]
    created_at: datetime
    updated_at: datetime


class SessionListResponse(BaseModel):
    """Wrapper for a list of sessions."""

    sessions: list[SessionResponse]
