"""Note model – MongoDB CRUD helpers for the 'notes' collection."""

from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

COLLECTION_NAME = "notes"


def _serialize(doc: dict[str, Any] | None) -> dict[str, Any] | None:
    """Convert a raw MongoDB document to an API-safe dict."""
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    return doc


async def create_note(
    db: AsyncIOMotorDatabase,
    user_id: str,
    title: str,
    content: str,
) -> dict[str, Any]:
    """Insert a new note and return the serialised document."""
    now = datetime.now(timezone.utc)
    note_doc = {
        "user_id": user_id,
        "title": title,
        "content": content,
        "created_at": now,
        "updated_at": now,
    }
    result = await db[COLLECTION_NAME].insert_one(note_doc)
    note_doc["_id"] = result.inserted_id
    return _serialize(note_doc)  # type: ignore[return-value]


async def get_notes(
    db: AsyncIOMotorDatabase,
    user_id: str,
) -> list[dict[str, Any]]:
    """Return all notes for *user_id*, newest first."""
    cursor = db[COLLECTION_NAME].find({"user_id": user_id}).sort("updated_at", -1)
    return [_serialize(doc) for doc in await cursor.to_list(length=None)]  # type: ignore[misc]


async def get_note(
    db: AsyncIOMotorDatabase,
    note_id: str,
    user_id: str,
) -> dict[str, Any] | None:
    """Fetch a single note by its ObjectId string, scoped to *user_id*."""
    try:
        oid = ObjectId(note_id)
    except Exception:
        return None
    doc = await db[COLLECTION_NAME].find_one({"_id": oid, "user_id": user_id})
    return _serialize(doc)


async def delete_note(
    db: AsyncIOMotorDatabase,
    note_id: str,
    user_id: str,
) -> bool:
    """Delete a note. Returns ``True`` if a document was actually removed."""
    try:
        oid = ObjectId(note_id)
    except Exception:
        return False
    result = await db[COLLECTION_NAME].delete_one({"_id": oid, "user_id": user_id})
    return result.deleted_count > 0
