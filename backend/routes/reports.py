from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
from models import ResponseModel
from database import get_db
from services.pdf_service import extract_text_and_date_from_pdf
from services.ocr_service import extract_text_and_date_from_image
from services.auth_service import decode_token

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
	payload = decode_token(token)
	return payload.get("sub")


@router.post("/upload", response_model=ResponseModel)
async def upload_report(
	patient_id: str = Form(...),
	file: UploadFile = File(...),
	user_id: str = Depends(get_current_user),
):
	db = get_db()
	if not await db.patients.find_one({"_id": ObjectId(patient_id)}):
		raise HTTPException(status_code=404, detail="Patient not found")

	uploaded_at = datetime.utcnow()
	content_type = file.content_type or ""
	if content_type.lower() == "application/pdf" or file.filename.lower().endswith(".pdf"):
		text, report_date = await extract_text_and_date_from_pdf(file)
		file_type = "pdf"
	else:
		text, report_date = await extract_text_and_date_from_image(file)
		file_type = "image"

	if not report_date:
		report_date = uploaded_at

	doc = {
		"patient_id": patient_id,
		"report_text": text,
		"report_date": report_date,
		"metadata": {"type": file_type, "uploaded_at": uploaded_at},
	}
	res = await db.reports.insert_one(doc)
	return {"success": True, "data": {"report_id": str(res.inserted_id)}, "error": None}


@router.get("/by-patient/{patient_id}", response_model=ResponseModel)
async def list_reports(patient_id: str, user_id: str = Depends(get_current_user)):
	db = get_db()
	cursor = db.reports.find({"patient_id": patient_id}).sort("report_date", 1)
	reports = []
	async for r in cursor:
		r["_id"] = str(r["_id"]) 
		reports.append(r)
	return {"success": True, "data": reports, "error": None}
