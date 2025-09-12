import asyncio
import os
import sys

# Ensure backend package root is on sys.path so local imports work no matter the cwd
THIS_DIR = os.path.dirname(__file__)
BACKEND_ROOT = os.path.normpath(os.path.join(THIS_DIR, os.pardir))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from services.auth_service import hash_password
from database import get_db


async def main():
    try:
        db = get_db()
    except Exception as e:
        print(f"Failed to connect to database or import db: {e}")
        raise

    email = "demo@healthai.com"
    pwd = "demo123"
    existing = await db.users.find_one({"email": email})
    if existing:
        print(f"User already exists: {email}")
        return

    password_hash = hash_password(pwd)
    res = await db.users.insert_one({"email": email, "password_hash": password_hash})
    print(f"Inserted demo user with id: {res.inserted_id}")


if __name__ == "__main__":
    asyncio.run(main())
