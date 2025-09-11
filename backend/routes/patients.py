from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
from models import PatientCreate, PatientUpdate, ResponseModel
from database import get_db
from utils.encryption import encrypt_string, decrypt_string
from services.auth_service import decode_token
import os

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
	payload = decode_token(token)
	return payload.get("sub")


@router.get("", response_model=ResponseModel)
async def list_patients(limit: int = Query(50, ge=1, le=200), skip: int = Query(0, ge=0), user_id: str = Depends(get_current_user)):
	db = get_db()
	cursor = db.patients.find({}, {"name": 1}).skip(skip).limit(limit)
	items = []
	async for p in cursor:
		items.append({"_id": str(p.get("_id")), "name": p.get("name")})
	return {"success": True, "data": items, "error": None}


@router.post("/", response_model=ResponseModel)
async def create_patient(payload: PatientCreate, user_id: str = Depends(get_current_user)):
	db = get_db()
	doc = payload.dict()
	# Encrypt sensitive fields
	for field in ["medical_history", "lifestyle"]:
		if doc.get(field):
			doc[field] = encrypt_string(doc[field])
	res = await db.patients.insert_one(doc)
	return {"success": True, "data": {"patient_id": str(res.inserted_id)}, "error": None}


@router.get("/{patient_id}", response_model=ResponseModel)
async def get_patient(patient_id: str, user_id: str = Depends(get_current_user)):
	db = get_db()
	patient = await db.patients.find_one({"_id": ObjectId(patient_id)})
	if not patient:
		raise HTTPException(status_code=404, detail="Patient not found")
	for field in ["medical_history", "lifestyle"]:
		if patient.get(field):
			patient[field] = decrypt_string(patient[field])
	patient["_id"] = str(patient["_id"]) 
	return {"success": True, "data": patient, "error": None}


@router.put("/{patient_id}", response_model=ResponseModel)
async def update_patient(patient_id: str, payload: PatientUpdate, user_id: str = Depends(get_current_user)):
	db = get_db()
	updates = {k: v for k, v in payload.dict(exclude_unset=True).items()}
	for field in ["medical_history", "lifestyle"]:
		if field in updates and updates[field] is not None:
			updates[field] = encrypt_string(updates[field])
	result = await db.patients.update_one({"_id": ObjectId(patient_id)}, {"$set": updates})
	if result.matched_count == 0:
		raise HTTPException(status_code=404, detail="Patient not found")
	return {"success": True, "data": {"updated": True}, "error": None}


@router.delete("/{patient_id}", response_model=ResponseModel)
async def delete_patient(patient_id: str, user_id: str = Depends(get_current_user)):
	db = get_db()
	result = await db.patients.delete_one({"_id": ObjectId(patient_id)})
	if result.deleted_count == 0:
		raise HTTPException(status_code=404, detail="Patient not found")
	return {"success": True, "data": {"deleted": True}, "error": None}
