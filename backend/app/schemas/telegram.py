"""Telegram schemas – request/response models for Telegram endpoints."""

from typing import Optional

from pydantic import BaseModel


class TelegramRequest(BaseModel):
    """Payload for sending a Telegram message."""

    message: str
    chat_id: Optional[str] = None


class TelegramResponse(BaseModel):
    """Result of a Telegram send operation."""

    success: bool
    message: str
