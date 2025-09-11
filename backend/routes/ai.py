from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
from models import ResponseModel, SymptomRequest, ChatMessage
from database import get_db
from services.ollama_service import analyze_reports_grouped_by_date, analyze_risk_heatmap, analyze_symptom_with_history, chat_with_history
from services.auth_service import decode_token

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
	payload = decode_token(token)
	return payload.get("sub")


@router.get("/segregated-reports/{patient_id}", response_model=ResponseModel)
async def segregated_reports(patient_id: str, user_id: str = Depends(get_current_user)):
	db = get_db()
	reports = []
	async for r in db.reports.find({"patient_id": patient_id}):
		r["_id"] = str(r["_id"]) 
		reports.append(r)
	result = await analyze_reports_grouped_by_date(reports)
	return {"success": True, "data": result, "error": None}


@router.get("/risk-heatmap/{patient_id}", response_model=ResponseModel)
async def risk_heatmap(patient_id: str, user_id: str = Depends(get_current_user)):
	db = get_db()
	reports = []
	async for r in db.reports.find({"patient_id": patient_id}):
		reports.append(r)
	result = await analyze_risk_heatmap(patient_id, reports)
	return {"success": True, "data": result, "error": None}


@router.post("/analyze_symptom/{patient_id}", response_model=ResponseModel)
async def analyze_symptom(patient_id: str, body: SymptomRequest, user_id: str = Depends(get_current_user)):
	db = get_db()
	reports = []
	async for r in db.reports.find({"patient_id": patient_id}).sort("report_date", 1):
		reports.append(r)
	result = await analyze_symptom_with_history(patient_id, body.symptom, reports)
	return {"success": True, "data": result, "error": None}


@router.post("/chat/{patient_id}", response_model=ResponseModel)
async def chat(patient_id: str, body: ChatMessage, user_id: str = Depends(get_current_user)):
	db = get_db()
	reports = []
	async for r in db.reports.find({"patient_id": patient_id}).sort("report_date", 1):
		reports.append(r)
	result = await chat_with_history(patient_id, body.message, reports)
	return {"success": True, "data": result, "error": None}
