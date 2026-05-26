"""
FastAPI dependency injection functions.

Provides reusable dependencies for authentication
and database access across API routes.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.security import verify_token
from app.database.mongodb import get_database

# HTTP Bearer token security scheme
security = HTTPBearer()


async def get_db() -> AsyncIOMotorDatabase:
    """
    Dependency that provides the MongoDB database instance.

    Returns:
        The AsyncIOMotorDatabase instance.
    """
    return get_database()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict:
    """
    Dependency that extracts and validates the current user from a JWT token.

    Extracts the Bearer token from the Authorization header, verifies the JWT,
    and fetches the corresponding user from the database.

    Args:
        credentials: The HTTP Bearer token credentials.
        db: The MongoDB database instance.

    Returns:
        The user document as a dictionary.

    Raises:
        HTTPException: 401 if the token is invalid or the user is not found.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = credentials.credentials
        payload = verify_token(token)
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Fetch user from database
    from bson import ObjectId

    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise credentials_exception

    if user is None:
        raise credentials_exception

    # Convert ObjectId to string for serialization
    user["id"] = str(user["_id"])
    return user
