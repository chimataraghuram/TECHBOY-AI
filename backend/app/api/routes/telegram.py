"""Telegram route – POST /telegram to send a message via the Telegram Bot API."""

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.deps import get_current_user, get_db
from app.core.config import get_settings
from app.models import task_log
from app.schemas.telegram import TelegramRequest, TelegramResponse
from app.services import telegram_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/telegram", tags=["Telegram"])


@router.post("", response_model=TelegramResponse)
async def send_telegram(
    body: TelegramRequest,
    user: dict[str, Any] = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> TelegramResponse:
    """Send a message to a Telegram chat.

    Uses the configured bot token from settings.  The ``chat_id`` can be
    supplied in the request body; if omitted the default from settings is used.
    """
    settings = get_settings()
    user_id: str = user["id"]
    chat_id = body.chat_id or settings.TELEGRAM_CHAT_ID

    if not chat_id:
        raise HTTPException(
            status_code=400,
            detail="No chat_id provided and TELEGRAM_CHAT_ID is not configured",
        )

    result = await telegram_service.send_message(
        chat_id=chat_id,
        text=body.message,
        bot_token=settings.TELEGRAM_BOT_TOKEN,
    )

    # Log task execution
    await task_log.create_log(
        db,
        user_id=user_id,
        session_id="",
        intent="send_telegram",
        params={"chat_id": chat_id, "message": body.message[:100]},
        result=result,
        message=result["message"],
    )

    return TelegramResponse(success=result["success"], message=result["message"])
