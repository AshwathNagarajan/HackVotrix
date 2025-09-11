import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET = os.getenv("JWT_SECRET", "change_this_in_production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRES_MINUTES = int(os.getenv("JWT_EXPIRES_MINUTES", "120"))


def hash_password(password: str) -> str:
	return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
	return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str, expires_minutes: Optional[int] = None) -> dict:
	expires_delta = timedelta(minutes=expires_minutes or JWT_EXPIRES_MINUTES)
	exp = datetime.now(timezone.utc) + expires_delta
	payload = {"sub": subject, "exp": exp}
	token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
	return {"access_token": token, "expires_in": int(expires_delta.total_seconds())}


def decode_token(token: str) -> dict:
	return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
