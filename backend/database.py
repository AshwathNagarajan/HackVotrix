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
	uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
	db_name = os.getenv("MONGODB_DB", "hackvotrix")
	_mongo_client = AsyncIOMotorClient(uri)
	_db = _mongo_client[db_name]
	logger.info(f"Connected to MongoDB database: {db_name}")
	return _db
