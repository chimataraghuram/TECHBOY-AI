"""Chat route – POST /chat for AI conversation with SSE streaming."""

import json
import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.deps import get_current_user, get_db
from app.agents.orchestrator import Orchestrator
from app.models import chat as chat_model
from app.schemas.chat import ChatRequest

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["Chat"])


async def _sse_generator(
    orchestrator: Orchestrator,
    message: str,
    session_id: str,
    user_id: str,
    db: AsyncIOMotorDatabase,
):
    """Yield Server-Sent Events from the orchestrator's response stream."""
    full_response: list[str] = []
    try:
        async for chunk in orchestrator.process(message, session_id, user_id):
            if isinstance(chunk, str):
                full_response.append(chunk)
                yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
            elif isinstance(chunk, dict):
                # Task result – yield as a single JSON event
                yield f"data: {json.dumps({'type': 'result', 'content': chunk})}\n\n"
                # Save the AI response to history
                ai_text = chunk.get("message", json.dumps(chunk))
                await chat_model.add_message(db, session_id, user_id, "assistant", ai_text)
                yield "data: [DONE]\n\n"
                return

        # Streaming completed – persist the full concatenated response
        if full_response:
            await chat_model.add_message(
                db, session_id, user_id, "assistant", "".join(full_response)
            )
    except Exception as exc:
        logger.exception("SSE generator error")
        yield f"data: {json.dumps({'type': 'error', 'content': str(exc)})}\n\n"

    yield "data: [DONE]\n\n"


@router.post("")
async def chat(
    body: ChatRequest,
    user: dict[str, Any] = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Handle a chat message.

    * Creates or retrieves a session.
    * Saves the user's message.
    * Routes through the Orchestrator.
    * Returns a ``StreamingResponse`` (SSE) for general chat or a plain
      JSON body for discrete task results.
    """
    user_id: str = user["id"]

    # ── Resolve / create session ──────────────────────────────────────
    session_id = body.session_id
    if session_id:
        session = await chat_model.get_session(db, session_id, user_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
    else:
        # Auto-title with the first 50 characters of the user message
        title = body.message[:50].strip() or "New Chat"
        session = await chat_model.create_session(db, user_id, title)
        session_id = session["session_id"]

    # ── Persist user message ──────────────────────────────────────────
    await chat_model.add_message(db, session_id, user_id, "user", body.message)

    # ── Auto-title on first message (if session was pre-existing but untitled)
    if session.get("title") == "New Chat" and len(session.get("messages", [])) == 0:
        new_title = body.message[:50].strip() or "New Chat"
        await chat_model.update_session(db, session_id, user_id, {"title": new_title})

    # ── Run orchestrator ──────────────────────────────────────────────
    orchestrator = Orchestrator()

    return StreamingResponse(
        _sse_generator(orchestrator, body.message, session_id, user_id, db),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Session-Id": session_id,
        },
    )
