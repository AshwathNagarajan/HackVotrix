import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from utils.logger import get_logger

logger = get_logger(__name__)

_mongo_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


def get_db() -> AsyncIOMotorDatabase:
    global _mongo_client, _db
    if _db is not None:
        return _db
    
    try:
        uri = os.getenv("DB_URI", "mongodb://localhost:27017")
        db_name = os.getenv("MONGODB_DB", "hackvotrix")
        
        # Set a shorter timeout for faster feedback
        _mongo_client = AsyncIOMotorClient(
            uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000
        )
        
        # Verify the connection works
        _mongo_client.admin.command('ping')
        
        _db = _mongo_client[db_name]
        logger.info(f"Successfully connected to MongoDB database: {db_name}")
        return _db
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        raise Exception("Database connection failed. Please ensure MongoDB is running.") from e
