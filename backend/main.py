import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import ORJSONResponse
import httpx
from database import get_db

from fastapi.middleware.wsgi import WSGIMiddleware
from recommendations import app as recommendations_app

from routes.auth import router as auth_router
from routes.patients import router as patients_router
from routes.reports import router as reports_router
from routes.ai import router as ai_router
from utils.logger import get_logger

try:
	load_dotenv()
except UnicodeDecodeError:
	# some editors save .env as UTF-16/UTF-16LE; retry with that encoding
	load_dotenv(encoding="utf-16")
logger = get_logger(__name__)

app = FastAPI(title="Hackvotrix Health AI Backend", default_response_class=ORJSONResponse)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],  # In production, replace with specific origins
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
	expose_headers=["*"]
)

static_dir = os.path.join(os.path.dirname(__file__), "static")
heatmap_dir = os.path.join(static_dir, "heatmaps")
os.makedirs(heatmap_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(patients_router, prefix="/patients", tags=["patients"])
app.include_router(reports_router, prefix="/reports", tags=["reports"])
app.include_router(ai_router, prefix="/ai", tags=["ai"])

# Mount the Flask recommendations app with proper routing
from recommendations import app as recommendations_app
app.mount("/api", WSGIMiddleware(recommendations_app))



@app.get("/health")
async def health_check():
    status = {
        "status": "ok",
        "database": "unknown",
        "ai_service": "unknown",
        "details": {}
    }
    
    # Check database connection
    try:
        db = get_db()
        await db.command("ping")
        status["database"] = "connected"
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Database health check failed: {error_msg}", exc_info=True)
        status["database"] = "disconnected"
        status["status"] = "degraded"
        status["details"]["database_error"] = error_msg
    
    # Check AI service connection
    GEMINI_HOST = os.getenv('GEMINI_HOST', 'http://localhost:12345')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not configured")
        status["ai_service"] = "not configured"
        status["status"] = "degraded"
        status["details"]["ai_service_error"] = "API key not configured"
    else:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get(f"{GEMINI_HOST}/health")
                if resp.status_code == 200:
                    status["ai_service"] = "connected"
                    try:
                        health_data = resp.json()
                        status["details"]["ai_service_health"] = health_data
                    except Exception:
                        status["details"]["ai_service_health"] = "Health check successful but no detailed data"
                else:
                    status["ai_service"] = "error"
                    status["status"] = "degraded"
                    error_msg = f"AI service returned status code: {resp.status_code}"
                    logger.error(error_msg)
                    status["details"]["ai_service_error"] = error_msg
        except httpx.ConnectError:
            error_msg = f"Could not connect to AI service at {GEMINI_HOST}"
            logger.error(error_msg)
            status["ai_service"] = "unreachable"
            status["status"] = "degraded"
            status["details"]["ai_service_error"] = error_msg
        except Exception as e:
            error_msg = str(e)
            logger.error(f"AI service health check failed: {error_msg}", exc_info=True)
            status["ai_service"] = "disconnected"
            status["status"] = "degraded"
            status["details"]["ai_service_error"] = error_msg
    
    # Add service version and uptime info
    from datetime import datetime
    status["version"] = "1.0.0"
    status["timestamp"] = datetime.utcnow().isoformat()
    
    return {"success": True, "data": status, "error": None}


async def startup():
    """Perform any async startup operations here"""
    logger.info("Starting up FastAPI application")
    try:
        db = get_db()
        await db.command("ping")
        logger.info("Database connection successful")
    except Exception as e:
        logger.error(f"Database startup error: {str(e)}")
        raise e

async def shutdown():
    """Perform any async shutdown operations here"""
    logger.info("Shutting down FastAPI application")
    global _mongo_client
    if _mongo_client:
        _mongo_client.close()

app.add_event_handler("startup", startup)
app.add_event_handler("shutdown", shutdown)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app="main:app",
        host="0.0.0.0",
        port=5000,
        reload=True,
        reload_dirs=["routes", "services", "utils"],
        workers=1,
        log_level="info"
    )
