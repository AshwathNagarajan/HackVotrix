from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Optional
from models import UserCreate, TokenResponse, ResponseModel
from services.auth_service import create_access_token, hash_password, verify_password
from database import get_db
from utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


@router.post("/signup", response_model=ResponseModel)
async def signup(payload: UserCreate):
	db = get_db()
	existing = await db.users.find_one({"email": payload.email})
	if existing:
		raise HTTPException(status_code=400, detail="Email already registered")
	password_hash = hash_password(payload.password)
	res = await db.users.insert_one({"email": payload.email, "password_hash": password_hash})
	return {"success": True, "data": {"user_id": str(res.inserted_id)}, "error": None}


@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
	db = get_db()
	user = await db.users.find_one({"email": form_data.username})
	if not user:
		raise HTTPException(status_code=401, detail="Invalid email. Please re-enter your credentials.")
	if not verify_password(form_data.password, user.get("password_hash", "")):
		raise HTTPException(status_code=401, detail="Invalid password. Please re-enter your credentials.")
	token_info = create_access_token(str(user["_id"]))
	return {
		"access_token": token_info["access_token"],
		"expires_in": token_info["expires_in"],
		"token_type": "bearer",
		"profileComplete": user.get("profileComplete", False)
	}
