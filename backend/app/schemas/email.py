"""Email schemas – request/response models for email endpoints."""

from typing import Optional

from pydantic import BaseModel, EmailStr


class SendEmailRequest(BaseModel):
    """Payload for sending an e-mail via Gmail."""

    to: EmailStr
    subject: str
    body: str


class EmailResponse(BaseModel):
    """Result of an e-mail send operation."""

    success: bool
    message: str
    message_id: Optional[str] = None
