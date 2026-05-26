"""Auth schemas – request/response models for authentication endpoints."""

from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    """Payload for user registration."""

    email: EmailStr
    username: str = Field(..., min_length=3, description="Display name (≥ 3 chars)")
    password: str = Field(..., min_length=6, description="Password (≥ 6 chars)")


class LoginRequest(BaseModel):
    """Payload for user login."""

    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Public-safe representation of a user."""

    id: str
    email: str
    username: str


class TokenResponse(BaseModel):
    """Returned after successful authentication."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse
