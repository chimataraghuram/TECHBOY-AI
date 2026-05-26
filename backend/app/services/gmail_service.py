"""Gmail service – send e-mails and create drafts via the Google Gmail API.

Requires a ``credentials.json`` (OAuth2 client secret) at the path
specified by ``settings.GMAIL_CREDENTIALS_PATH``.  On first run an
interactive OAuth2 flow will generate ``token.json`` next to it.
"""

import base64
import os
from email.message import EmailMessage
from typing import Any

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

from app.core.config import get_settings

# If modifying these SCOPES, delete token.json so a new one is generated.
SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.compose",
]


def _token_path() -> str:
    """Return the path for the cached OAuth2 token file."""
    settings = get_settings()
    creds_dir = os.path.dirname(settings.GMAIL_CREDENTIALS_PATH)
    return os.path.join(creds_dir, "token.json")


def get_gmail_service():
    """Build and return an authenticated Gmail API service object.

    * If ``token.json`` exists and is valid, it is reused.
    * If the token is expired but refreshable, it is refreshed.
    * Otherwise an interactive OAuth2 consent flow is started.
    """
    settings = get_settings()
    creds: Credentials | None = None
    token_file = _token_path()

    if os.path.exists(token_file):
        creds = Credentials.from_authorized_user_file(token_file, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                settings.GMAIL_CREDENTIALS_PATH, SCOPES
            )
            creds = flow.run_local_server(port=0)
        # Persist for next run
        with open(token_file, "w") as f:
            f.write(creds.to_json())

    return build("gmail", "v1", credentials=creds)


def _build_mime(to: str, subject: str, body: str) -> str:
    """Create a base64url-encoded MIME message string."""
    msg = EmailMessage()
    msg.set_content(body)
    msg["To"] = to
    msg["Subject"] = subject
    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode("utf-8")
    return raw


async def send_email(to: str, subject: str, body: str) -> dict[str, Any]:
    """Send an e-mail and return ``{'message_id': ...}``."""
    service = get_gmail_service()
    raw_message = _build_mime(to, subject, body)
    result = (
        service.users()
        .messages()
        .send(userId="me", body={"raw": raw_message})
        .execute()
    )
    return {"message_id": result.get("id", "")}


async def create_draft(to: str, subject: str, body: str) -> dict[str, Any]:
    """Create a Gmail draft and return ``{'draft_id': ...}``."""
    service = get_gmail_service()
    raw_message = _build_mime(to, subject, body)
    draft = (
        service.users()
        .drafts()
        .create(userId="me", body={"message": {"raw": raw_message}})
        .execute()
    )
    return {"draft_id": draft.get("id", "")}
