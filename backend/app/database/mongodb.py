"""
MongoDB connection management using Motor async driver.

Provides global client/database references and lifecycle
functions for connecting and disconnecting from MongoDB.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import get_settings

# Global MongoDB client and database references
client: AsyncIOMotorClient | None = None
database: AsyncIOMotorDatabase | None = None


async def connect_db() -> None:
    """
    Establish connection to MongoDB.

    Initializes the global client and database references
    using settings from the application configuration.
    """
    global client, database
    settings = get_settings()
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    database = client[settings.DATABASE_NAME]

    # Verify connection by pinging the server
    try:
        await client.admin.command("ping")
        print(f"✅ Connected to MongoDB: {settings.DATABASE_NAME}")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        raise


async def close_db() -> None:
    """
    Close the MongoDB connection.

    Cleans up the global client reference and releases resources.
    """
    global client, database
    if client is not None:
        client.close()
        client = None
        database = None
        print("🔌 Disconnected from MongoDB")


def get_database() -> AsyncIOMotorDatabase:
    """
    Get the current MongoDB database instance.

    Returns:
        The AsyncIOMotorDatabase instance.

    Raises:
        RuntimeError: If the database connection has not been established.
    """
    if database is None:
        raise RuntimeError(
            "Database not initialized. Ensure connect_db() has been called."
        )
    return database
