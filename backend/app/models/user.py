"""User model – MongoDB CRUD helpers for the 'users' collection."""

from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

COLLECTION_NAME = "users"


def _serialize(doc: dict[str, Any] | None) -> dict[str, Any] | None:
    """Convert a raw MongoDB document to an API-safe dict.

    * ``_id`` (ObjectId) is replaced by a string ``id`` field.
    * ``hashed_password`` is preserved so the auth layer can verify it,
      but callers should strip it before returning to the client.
    """
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    return doc


async def create_user(
    db: AsyncIOMotorDatabase,
    email: str,
    username: str,
    hashed_password: str,
) -> dict[str, Any]:
    """Insert a new user document and return the serialised result."""
    now = datetime.now(timezone.utc)
    user_doc = {
        "email": email,
        "username": username,
        "hashed_password": hashed_password,
        "created_at": now,
        "updated_at": now,
    }
    result = await db[COLLECTION_NAME].insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return _serialize(user_doc)  # type: ignore[return-value]


async def get_user_by_email(
    db: AsyncIOMotorDatabase,
    email: str,
) -> dict[str, Any] | None:
    """Look up a user by their e-mail address."""
    doc = await db[COLLECTION_NAME].find_one({"email": email})
    return _serialize(doc)


async def get_user_by_id(
    db: AsyncIOMotorDatabase,
    user_id: str,
) -> dict[str, Any] | None:
    """Look up a user by their string id (ObjectId)."""
    try:
        oid = ObjectId(user_id)
    except Exception:
        return None
    doc = await db[COLLECTION_NAME].find_one({"_id": oid})
    return _serialize(doc)
