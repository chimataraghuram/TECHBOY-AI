"""Task-log model – MongoDB CRUD helpers for the 'task_logs' collection."""

from datetime import datetime, timezone
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

COLLECTION_NAME = "task_logs"


def _serialize(doc: dict[str, Any] | None) -> dict[str, Any] | None:
    """Convert a raw MongoDB document to an API-safe dict."""
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    return doc


async def create_log(
    db: AsyncIOMotorDatabase,
    user_id: str,
    session_id: str,
    intent: str,
    params: dict[str, Any],
    result: dict[str, Any],
    message: str,
) -> dict[str, Any]:
    """Record a task execution and return the serialised log entry."""
    log_doc = {
        "user_id": user_id,
        "session_id": session_id,
        "intent": intent,
        "params": params,
        "result": result,
        "message": message,
        "executed_at": datetime.now(timezone.utc),
    }
    insert_result = await db[COLLECTION_NAME].insert_one(log_doc)
    log_doc["_id"] = insert_result.inserted_id
    return _serialize(log_doc)  # type: ignore[return-value]


async def get_logs(
    db: AsyncIOMotorDatabase,
    user_id: str,
    limit: int = 50,
) -> list[dict[str, Any]]:
    """Return the most recent *limit* task logs for *user_id*."""
    cursor = (
        db[COLLECTION_NAME]
        .find({"user_id": user_id})
        .sort("executed_at", -1)
        .limit(limit)
    )
    return [_serialize(doc) for doc in await cursor.to_list(length=limit)]  # type: ignore[misc]
