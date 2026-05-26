"""
Authentication API routes.

Provides endpoints for user registration, login,
and retrieving the current user profile.
"""

from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, EmailStr

from app.api.deps import get_current_user, get_db
from app.core.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ── Inline Schemas (temporary until app.schemas.auth is created) ─────────────


class SignupRequest(BaseModel):
    """Request schema for user registration."""
    email: str
    username: str
    password: str


class LoginRequest(BaseModel):
    """Request schema for user login."""
    email: str
    password: str


class TokenResponse(BaseModel):
    """Response schema containing a JWT access token."""
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Response schema for user profile data."""
    id: str
    email: str
    username: str


# ── Routes ───────────────────────────────────────────────────────────────────


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    request: SignupRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> TokenResponse:
    """
    Register a new user account.

    Creates a new user with hashed password, stores it in MongoDB,
    and returns a JWT access token.

    Raises:
        HTTPException: 400 if the email is already registered.
    """
    # Check if email already exists
    existing_user = await db.users.find_one({"email": request.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create user document
    user_doc = {
        "email": request.email,
        "username": request.username,
        "password_hash": hash_password(request.password),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Generate JWT token
    access_token = create_access_token(user_id)
    return TokenResponse(access_token=access_token)


@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> TokenResponse:
    """
    Authenticate a user and return a JWT token.

    Verifies email and password against stored credentials.

    Raises:
        HTTPException: 401 if credentials are invalid.
    """
    # Find user by email
    user = await db.users.find_one({"email": request.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Verify password
    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Generate JWT token
    user_id = str(user["_id"])
    access_token = create_access_token(user_id)
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: dict = Depends(get_current_user),
) -> UserResponse:
    """
    Get the current authenticated user's profile.

    Requires a valid JWT token in the Authorization header.
    """
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        username=current_user["username"],
    )
