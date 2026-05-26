"""Chat model – MongoDB CRUD helpers for the 'chat_history' collection."""

from datetime import datetime, timezone
from typing import Any
import uuid

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

COLLECTION_NAME = "chat_history"


def _serialize(doc: dict[str, Any] | None) -> dict[str, Any] | None:
    """Convert a raw MongoDB document to an API-safe dict.

    Replaces ``_id`` (ObjectId) with a string ``id`` field.
    """
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    return doc


async def create_session(
    db: AsyncIOMotorDatabase,
    user_id: str,
    title: str,
    messages: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Create a new chat session for *user_id* and return the serialised doc."""
    now = datetime.now(timezone.utc)
    session_doc = {
        "user_id": user_id,
        "session_id": str(uuid.uuid4()),
        "title": title,
        "messages": messages or [],
        "created_at": now,
        "updated_at": now,
    }
    result = await db[COLLECTION_NAME].insert_one(session_doc)
    session_doc["_id"] = result.inserted_id
    return _serialize(session_doc)  # type: ignore[return-value]


async def get_sessions(
    db: AsyncIOMotorDatabase,
    user_id: str,
) -> list[dict[str, Any]]:
    """Return all sessions for *user_id*, newest first."""
    cursor = db[COLLECTION_NAME].find({"user_id": user_id}).sort("updated_at", -1)
    return [_serialize(doc) for doc in await cursor.to_list(length=None)]  # type: ignore[misc]


async def get_session(
    db: AsyncIOMotorDatabase,
    session_id: str,
    user_id: str,
) -> dict[str, Any] | None:
    """Fetch a single session by its UUID *session_id*, scoped to *user_id*."""
    doc = await db[COLLECTION_NAME].find_one(
        {"session_id": session_id, "user_id": user_id}
    )
    return _serialize(doc)


async def update_session(
    db: AsyncIOMotorDatabase,
    session_id: str,
    user_id: str,
    update_data: dict[str, Any],
) -> dict[str, Any] | None:
    """Update arbitrary fields on a session and return the updated doc."""
    update_data["updated_at"] = datetime.now(timezone.utc)
    result = await db[COLLECTION_NAME].find_one_and_update(
        {"session_id": session_id, "user_id": user_id},
        {"$set": update_data},
        return_document=True,
    )
    return _serialize(result)


async def delete_session(
    db: AsyncIOMotorDatabase,
    session_id: str,
    user_id: str,
) -> bool:
    """Delete a session. Returns ``True`` if a document was actually removed."""
    result = await db[COLLECTION_NAME].delete_one(
        {"session_id": session_id, "user_id": user_id}
    )
    return result.deleted_count > 0


async def add_message(
    db: AsyncIOMotorDatabase,
    session_id: str,
    user_id: str,
    role: str,
    text: str,
) -> dict[str, Any]:
    """Append a message to a session's message list and return the updated doc."""
    now = datetime.now(timezone.utc)
    message = {"role": role, "text": text, "timestamp": now}
    result = await db[COLLECTION_NAME].find_one_and_update(
        {"session_id": session_id, "user_id": user_id},
        {
            "$push": {"messages": message},
            "$set": {"updated_at": now},
        },
        return_document=True,
    )
    return _serialize(result)  # type: ignore[return-value]
