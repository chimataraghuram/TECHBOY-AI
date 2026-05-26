"""Notes service – thin wrapper around the note model layer."""

from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models import note as note_model


async def create_note(
    db: AsyncIOMotorDatabase,
    user_id: str,
    title: str,
    content: str,
) -> dict[str, Any]:
    """Create and return a new note for *user_id*."""
    return await note_model.create_note(db, user_id, title, content)


async def list_notes(
    db: AsyncIOMotorDatabase,
    user_id: str,
) -> list[dict[str, Any]]:
    """Return all notes belonging to *user_id*."""
    return await note_model.get_notes(db, user_id)


async def remove_note(
    db: AsyncIOMotorDatabase,
    note_id: str,
    user_id: str,
) -> bool:
    """Delete a note. Returns ``True`` if a document was actually removed."""
    return await note_model.delete_note(db, note_id, user_id)
