"""
Security utilities for JWT token management and password hashing.

Provides functions for creating/verifying JWT tokens and
hashing/verifying passwords using bcrypt.
"""

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(user_id: str) -> str:
    """
    Create a JWT access token for the given user.

    Args:
        user_id: The unique identifier of the user.

    Returns:
        Encoded JWT token string.
    """
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRY_MINUTES)
    payload = {
        "sub": user_id,
        "exp": expire,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def verify_token(token: str) -> dict:
    """
    Decode and verify a JWT token.

    Args:
        token: The JWT token string to verify.

    Returns:
        Decoded token payload dictionary.

    Raises:
        JWTError: If the token is invalid or expired.
    """
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except JWTError:
        raise


def hash_password(password: str) -> str:
    """
    Hash a plaintext password using bcrypt.

    Args:
        password: The plaintext password to hash.

    Returns:
        The bcrypt-hashed password string.
    """
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """
    Verify a plaintext password against a hashed password.

    Args:
        plain: The plaintext password to check.
        hashed: The bcrypt-hashed password to compare against.

    Returns:
        True if the password matches, False otherwise.
    """
    return pwd_context.verify(plain, hashed)
