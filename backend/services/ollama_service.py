import os
import json
import asyncio
from typing import List, Dict, Any, Optional
import httpx
from datetime import datetime
from services.heatmap_service import generate_risk_heatmap_image
from utils.logger import get_logger
from fastapi import HTTPException

# Configuration with validation
GEMINI_HOST = os.getenv("GEMINI_HOST", "http://localhost:12345").rstrip('/')
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-v1")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize logger
logger = get_logger(__name__)



async def _gemini_chat(prompt: str, retries: int = 2, timeout: int = 10) -> Optional[str]:
    """
    Make a request to the Gemini AI service with retry logic and better error handling.
    
    Args:
        prompt: The text prompt to send to the AI
        retries: Number of retry attempts (default: 2)
        timeout: Request timeout in seconds (default: 10)
        
    Returns:
        The AI response string or None if all retries fail
    """
    if not GEMINI_API_KEY:
        logger.error("GEMINI_API_KEY not configured")
        return None
        
    last_error = None
    for attempt in range(retries):
        try:
            payload = {
                "model": GEMINI_MODEL,
                "input": prompt
            }
            
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    f"{GEMINI_HOST}/api/chat",
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {GEMINI_API_KEY}",
                        "Content-Type": "application/json"
                    }
                )
                response.raise_for_status()
                
                data = response.json()
                if not isinstance(data, dict):
                    raise ValueError("Invalid response format")
                    
                result = data.get("response")
                if not result or not isinstance(result, str):
                    raise ValueError("Missing or invalid response")
                    
                return result.strip()
                
        except httpx.HTTPStatusError as e:
            last_error = f"HTTP error: {e.response.status_code}"
            logger.error(f"HTTP error on attempt {attempt + 1}: {last_error}")
        except httpx.RequestError as e:
            last_error = f"Request error: {str(e)}"
            logger.error(f"Request error on attempt {attempt + 1}: {last_error}")
        except Exception as e:
            last_error = str(e)
            logger.error(f"Unexpected error on attempt {attempt + 1}: {last_error}")
            
        if attempt < retries - 1:
            await asyncio.sleep(1)
            
    logger.error(f"All {retries} attempts failed. Last error: {last_error}")
    return None


async def analyze_reports_grouped_by_date(reports: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Analyze medical reports and group them by date with AI-powered insights."""
    logger.info("Starting analysis of reports grouped by date.")
    
    if not reports:
        logger.warning("No reports provided for analysis")
        return {
            "groups": {},
            "lab_records": [],
            "pros": [],
            "cons": []
        }
    
    try:
        # Combine all report texts for analysis
        all_text = "\n\n".join([
            f"[Report from {r.get('report_date')}]\n{r.get('report_text', '')}"
            for r in reports if r.get('report_text')
        ])
        
        if not all_text.strip():
            raise ValueError("No valid report text found for analysis")
        
        # Get AI analysis of health indicators
        analysis_prompt = (
            "You are an expert medical analyst. Analyze these medical reports and identify:\n"
            "1. Positive health indicators (3-5 specific findings)\n"
            "2. Areas needing attention (3-5 specific concerns)\n\n"
            "Format your response as JSON with 'pros' and 'cons' arrays. Example:\n"
            '{\n'
            '  "pros": [\n'
            '    "Blood pressure well-controlled at 120/80",\n'
            '    "Regular exercise routine maintained"\n'
            '  ],\n'
            '  "cons": [\n'
            '    "Fasting glucose elevated at 110 mg/dL",\n'
            '    "Missed follow-up appointment"\n'
            '  ]\n'
            '}\n\n'
            f"Reports to analyze:\n{all_text[:4000]}"
        )
        
        analysis_response = await _gemini_chat(analysis_prompt)
        analysis_data = json.loads(analysis_response) if analysis_response else {}
        
        # Validate and sanitize the response
        if not isinstance(analysis_data, dict):
            raise ValueError("Invalid response format from AI service")
            
        pros = analysis_data.get('pros', [])
        cons = analysis_data.get('cons', [])
        
        if not isinstance(pros, list) or not isinstance(cons, list):
            raise ValueError("Invalid data structure in AI response")
            
        # Ensure we have at least some content
        if not pros and not cons:
            logger.warning("AI analysis returned empty results")
            pros = ["Regular health monitoring maintained"]
            cons = ["Further health assessment recommended"]
            
    except Exception as e:
        logger.error(f"Error during AI analysis: {str(e)}")
        pros = ["Regular health monitoring noted"]
        cons = ["Additional health evaluation recommended"]
        
    # Process reports by date
    groups: Dict[str, List[Dict[str, Any]]] = {}
    lab_records: List[Dict[str, Any]] = []
    
    try:
        for i, r in enumerate(reports):
            logger.debug(f"Processing report {i+1}/{len(reports)}")
            
            # Get report date
            rd = r.get("report_date")
            try:
                if isinstance(rd, str):
                    rd_dt = datetime.fromisoformat(rd.replace("Z", "+00:00"))
                else:
                    rd_dt = rd if rd else datetime.now()
                key = rd_dt.date().isoformat()
            except Exception:
                key = "unknown"
                logger.warning(f"Could not parse date for report {r.get('_id')}")
            
            # Store report summary
            groups.setdefault(key, []).append({
                "id": str(r.get("_id", "")),
                "type": r.get("metadata", {}).get("type", "unknown"),
                "summary": (r.get("report_text", "") or "")[:300]
            })
            
            # Extract lab records if present
            if r.get("metadata", {}).get("type", "").lower().startswith("lab"):
                lab_details = {
                    "date": key,
                    "test_type": r.get("metadata", {}).get("test_type", "General Lab Test"),
                    "findings": r.get("report_text", "No findings recorded")
                }
                lab_records.append(lab_details)
                
    except Exception as e:
        logger.error(f"Error processing reports: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing medical reports")
    
    logger.info(f"Analysis complete. Found {len(lab_records)} lab records.")
    return {
        "groups": groups,
        "lab_records": lab_records,
        "pros": pros,
        "cons": cons
    }


async def analyze_risk_heatmap(patient_id: str, reports: List[Dict[str, Any]]) -> Dict[str, Any]:
	# Build concise prompt for risk extraction
	joined = "\n\n".join([f"[Report {i+1} on {str(r.get('report_date'))}]\n{r.get('report_text','')[:2000]}" for i, r in enumerate(reports)])
	prompt = (
		"You are a clinical risk analyst. From the patient's reports, output JSON with normalized risk scores (0-1) for categories: "
		"cardiac, diabetes, respiratory, renal, hepatic, neurological, oncological, musculoskeletal."
		"If unknown, use 0.2. Only return JSON.\n\nReports:\n" + joined
	)
	resp = await _gemini_chat(prompt)
	# naive JSON parse fallback
	import json
	try:
		parsed = json.loads(resp)
	except Exception:
		parsed = {"cardiac": 0.3, "diabetes": 0.3, "respiratory": 0.3, "renal": 0.3, "hepatic": 0.3, "neurological": 0.3, "oncological": 0.3, "musculoskeletal": 0.3}
	img = generate_risk_heatmap_image(patient_id, parsed)
	return {"risks": parsed, "heatmap": img}


async def analyze_symptom_with_history(patient_id: str, symptom: str, reports: List[Dict[str, Any]]) -> Dict[str, Any]:
	joined = "\n\n".join([f"[{str(r.get('report_date'))}]\n{r.get('report_text','')[:1200]}" for r in reports])
	prompt = (
		"Given the historical clinical notes, analyze the likely root causes for the new symptom. "
		"Provide a short explanation and reference which prior report dates support it. "
		"Return JSON: { explanation: string, references: [date strings] }.\n\n"
		f"Symptom: {symptom}\n\nHistory:\n" + joined
	)
	resp = await _gemini_chat(prompt)
	import json
	try:
		parsed = json.loads(resp)
	except Exception:
		parsed = {"explanation": resp.strip()[:800], "references": []}
	return parsed


async def chat_with_history(patient_id: str, message: str, reports: List[Dict[str, Any]], history: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    try:
        logger.info(f"Processing chat request for patient {patient_id}")
        
        # Check if this is a health metric request
        is_health_metric = "health effects" in message.lower() or "prevention" in message.lower() or "recommendations" in message.lower()
        
        # Get recent medical context from reports
        context = "\n\n".join([f"[{str(r.get('report_date'))}] {r.get('report_text','')[:800]}" for r in reports])
        
        # Build conversation history string
        conversation = ""
        if history:
            # Only use last 5 messages for context to avoid token limit
            recent_history = history[-5:]
            for msg in recent_history:
                role = "User" if msg.get("sender") == "user" else "Assistant"
                conversation += f"{role}: {msg.get('text')}\n"
        
        # Customize prompt based on request type
        if is_health_metric:
            prompt = (
                "You are a medical expert. Provide specific, evidence-based information about the following health concern.\n"
                "Be clear, concise, and factual. If suggesting actions, ensure they are safe and general.\n\n"
                f"Patient Context:\n{context}\n\n"
                f"Question:\n{message}\n"
                "Response (be specific and actionable, but avoid direct medical advice):"
            )
        else:
            prompt = (
                "You are a helpful medical AI assistant. Use patient context and conversation history to answer succinctly and safely.\n"
                "If uncertain, say so.\n\n"
                f"Patient Context:\n{context}\n\n"
                f"Conversation History:\n{conversation}\n"
                f"User: {message}\n"
                "Assistant:"
            )
            
        resp = await _gemini_chat(prompt)
        logger.info("Successfully received AI response")
        
        if resp is None:
            if is_health_metric:
                return {
                    "reply": (
                        "Based on general health guidelines:\n\n"
                        "1. Monitor your symptoms and maintain a health diary\n"
                        "2. Follow your prescribed treatment plan\n"
                        "3. Maintain regular check-ups with your healthcare provider\n"
                        "4. Practice healthy lifestyle habits\n\n"
                        "Please consult your healthcare provider for personalized advice."
                    )
                }
            return {
                "reply": "I apologize, but I'm unable to provide specific recommendations at this moment. Please consult with your healthcare provider."
            }
            
        return {"reply": resp.strip()}
    except Exception as e:
        logger.error(f"Error in chat_with_history: {str(e)}", exc_info=True)
        if is_health_metric:
            return {
                "reply": (
                    "While I'm unable to access specific details at the moment, here are general health recommendations:\n\n"
                    "1. Follow your prescribed treatment plan\n"
                    "2. Maintain regular medical check-ups\n"
                    "3. Report any significant changes to your healthcare provider\n"
                    "4. Practice healthy lifestyle habits\n\n"
                    "For personalized advice, please consult your healthcare provider."
                )
            }
        return {
            "reply": "I apologize, but I'm experiencing technical difficulties. Please try again later or consult with your healthcare provider."
        }
