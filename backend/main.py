import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import ORJSONResponse

from routes.auth import router as auth_router
from routes.patients import router as patients_router
from routes.reports import router as reports_router
from routes.ai import router as ai_router
from utils.logger import get_logger

load_dotenv()
logger = get_logger(__name__)

app = FastAPI(title="Hackvotrix Health AI Backend", default_response_class=ORJSONResponse)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
	CORSMiddleware,
	allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

static_dir = os.path.join(os.path.dirname(__file__), "static")
heatmap_dir = os.path.join(static_dir, "heatmaps")
os.makedirs(heatmap_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(patients_router, prefix="/patients", tags=["patients"])
app.include_router(reports_router, prefix="/reports", tags=["reports"])
app.include_router(ai_router, prefix="/ai", tags=["ai"])


@app.get("/health")
async def health_check():
	return {"success": True, "data": {"status": "ok"}, "error": None}
