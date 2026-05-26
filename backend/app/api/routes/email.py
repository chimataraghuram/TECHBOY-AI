"""Email route – POST /email/send-email to send e-mail via Gmail."""

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.deps import get_current_user, get_db
from app.models import task_log
from app.schemas.email import EmailResponse, SendEmailRequest
from app.services import gmail_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/email", tags=["Email"])


@router.post("/send-email", response_model=EmailResponse)
async def send_email(
    body: SendEmailRequest,
    user: dict[str, Any] = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> EmailResponse:
    """Send an e-mail using the authenticated user's Gmail account.

    Logs the task execution regardless of success or failure.
    """
    user_id: str = user["id"]
    try:
        result = await gmail_service.send_email(body.to, body.subject, body.body)
        message_id = result.get("message_id")

        # Log success
        await task_log.create_log(
            db,
            user_id=user_id,
            session_id="",
            intent="send_email",
            params={"to": body.to, "subject": body.subject},
            result={"success": True, "message_id": message_id},
            message=f"Email sent to {body.to}",
        )

        return EmailResponse(
            success=True,
            message=f"Email sent successfully to {body.to}",
            message_id=message_id,
        )

    except Exception as exc:
        logger.exception("Failed to send email")

        # Log failure
        await task_log.create_log(
            db,
            user_id=user_id,
            session_id="",
            intent="send_email",
            params={"to": body.to, "subject": body.subject},
            result={"success": False, "error": str(exc)},
            message=f"Failed to send email to {body.to}",
        )

        raise HTTPException(status_code=500, detail=f"Failed to send email: {exc}")
