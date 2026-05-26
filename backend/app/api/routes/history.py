"""History route – manage chat sessions and their messages."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel

from app.api.deps import get_current_user, get_db
from app.models import chat as chat_model
from app.schemas.chat import SessionListResponse, SessionResponse

router = APIRouter(prefix="/history", tags=["History"])


class RenameRequest(BaseModel):
    """Payload for renaming a session."""

    title: str


@router.get("", response_model=SessionListResponse)
async def list_sessions(
    user: dict[str, Any] = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> SessionListResponse:
    """Return all chat sessions for the authenticated user (newest first)."""
    sessions = await chat_model.get_sessions(db, user["id"])
    return SessionListResponse(
        sessions=[SessionResponse(**s) for s in sessions]
    )


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: str,
    user: dict[str, Any] = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> SessionResponse:
    """Retrieve a single session with all its messages."""
    session = await chat_model.get_session(db, session_id, user["id"])
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionResponse(**session)


@router.delete("/{session_id}", status_code=204)
async def delete_session(
    session_id: str,
    user: dict[str, Any] = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> None:
    """Delete a chat session and all its messages."""
    deleted = await chat_model.delete_session(db, session_id, user["id"])
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")


@router.put("/{session_id}", response_model=SessionResponse)
async def rename_session(
    session_id: str,
    body: RenameRequest,
    user: dict[str, Any] = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> SessionResponse:
    """Rename a chat session."""
    updated = await chat_model.update_session(
        db, session_id, user["id"], {"title": body.title}
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionResponse(**updated)
