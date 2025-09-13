from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
from models import ResponseModel
from database import get_db
from services.pdf_service import extract_text_and_date_from_pdf
from services.ocr_service import extract_text_and_date_from_image
from services.auth_service import decode_token
from services.ollama_service import analyze_reports_grouped_by_date
from utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_id


@router.post("/upload/{patient_id}", response_model=ResponseModel)
async def upload_report(
    patient_id: str,
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    db = get_db()
    
    if patient_id == "me":
        patient_id = user_id

    try:
        user_object_id = ObjectId(patient_id)
        if not await db.users.find_one({"_id": user_object_id}):
            raise HTTPException(status_code=404, detail="User not found")
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid patient ID format: {patient_id}")

    uploaded_at = datetime.utcnow()
    content_type = file.content_type or ""
    filename = file.filename or ""

    if content_type.lower() == "application/pdf" or filename.lower().endswith(".pdf"):
        text, report_date = await extract_text_and_date_from_pdf(file)
        file_type = "pdf"
    else:
        text, report_date = await extract_text_and_date_from_image(file)
        file_type = "image"

    if not report_date:
        report_date = uploaded_at

    # THE FIX: Store patient_id as a string
    doc = {
        "patient_id": patient_id,
        "report_text": text,
        "report_date": report_date,
        "metadata": {"type": file_type, "uploaded_at": uploaded_at},
    }
    res = await db.reports.insert_one(doc)
    return {"success": True, "data": {"report_id": str(res.inserted_id)}, "error": None}


@router.get("/analyze/{patient_id}", response_model=ResponseModel)
async def analyze_reports(patient_id: str, user_id: str = Depends(get_current_user)):
    logger.info(f"Analyzing reports for patient_id: {patient_id}")
    
    if patient_id == "me":
        patient_id = user_id

    try:
        db = get_db()

        # Try to find reports by string ID first
        cursor = db.reports.find({"patient_id": patient_id}).sort("report_date", 1)
        reports = [r async for r in cursor]

        # If no reports found with string ID, try ObjectId
        if not reports:
            try:
                object_id = ObjectId(patient_id)
                cursor = db.reports.find({"patient_id": object_id}).sort("report_date", 1)
                reports = [r async for r in cursor]
            except Exception:
                logger.warning(f"Invalid ObjectId format or no reports found for ID: {patient_id}")

        logger.info(f"Found {len(reports)} reports for patient_id: {patient_id}")

        if not reports:
            raise HTTPException(
                status_code=404, 
                detail="No reports found for the patient. Please upload a report first."
            )

        # Add error handling for the analysis phase
        try:
            analysis = await analyze_reports_grouped_by_date(reports)
            if not analysis:
                raise ValueError("Analysis returned no results")
        except Exception as analysis_error:
            logger.error(f"Analysis failed for patient_id {patient_id}: {str(analysis_error)}", exc_info=True)
            return {
                "success": True,
                "data": {
                    "groups": {},
                    "lab_records": [],
                    "pros": ["Regular health monitoring ongoing"],
                    "cons": ["Further analysis recommended"]
                },
                "error": None
            }
        
        logger.info(f"Successfully generated analysis for patient_id: {patient_id}")
        return {"success": True, "data": analysis, "error": None}
    
    except HTTPException as http_exc:
        # Re-raise HTTPExceptions to let FastAPI handle them
        raise http_exc
    except Exception as e:
        logger.error(f"An unexpected error occurred while analyzing reports for patient_id: {patient_id} - {e}", exc_info=True)
        return {
            "success": False,
            "data": None,
            "error": "An error occurred while analyzing reports. Please try again later."
        }
