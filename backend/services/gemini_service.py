from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
import os
import httpx
import logging
import asyncio
from dotenv import load_dotenv

# Load environment variables
try:
    load_dotenv()
except UnicodeDecodeError:
    # Some editors save .env as UTF-16/UTF-16LE
    load_dotenv(encoding="utf-16")

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Gemini API settings
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY not found in environment variables")

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent"

class ChatRequest(BaseModel):
    model: str
    input: str

class ChatResponse(BaseModel):
    response: str

async def get_fallback_response(input_text: str) -> dict:
    """Generate a fallback response when the Gemini API is unavailable."""
    input_lower = input_text.lower()
    
    # Check if this is an analysis prompt
    if "effects" in input_lower and "health" in input_lower:
        return {"response": """Key Health Effects to Monitor:
• Short-term effects on daily activities and quality of life
• Potential complications if left unmanaged
• Impact on overall health and well-being
• Related health metrics that may be affected
Please consult your healthcare provider for a personalized assessment."""}
    
    elif "prevent" in input_lower or "manage" in input_lower:
        return {"response": """Prevention & Management Strategies:
1. Schedule regular check-ups with your healthcare provider
2. Monitor related health metrics consistently
3. Maintain a healthy lifestyle (balanced diet, regular exercise)
4. Keep detailed records of any symptoms or changes
5. Follow your prescribed treatment plan strictly"""}
    
    elif "action" in input_lower or "steps" in input_lower or "recommend" in input_lower:
        return {"response": """Recommended Action Steps:
1. Schedule a follow-up appointment with your healthcare provider
2. Review and track your health metrics daily
3. Document any changes or concerns
4. Create a regular health monitoring routine
5. Consider lifestyle modifications as advised by your doctor"""}
    
    # Basic keyword-based responses for specific health topics
    elif "exercise" in input_lower:
        return {"response": """Exercise Recommendations:
• Start with 30 minutes of moderate activity 5 days/week
• Include both cardio and strength training
• Monitor heart rate and breathing
• Warm up and cool down properly
• Track your progress regularly
Always consult your doctor before starting a new exercise routine."""}
    
    elif "nutrition" in input_lower or "diet" in input_lower or "food" in input_lower:
        return {"response": """Nutrition Guidelines:
1. Focus on balanced meals with all food groups
2. Increase intake of fresh fruits and vegetables
3. Choose whole grains over refined grains
4. Include lean proteins and healthy fats
5. Monitor portion sizes
6. Stay hydrated with water throughout the day
7. Limit processed foods and added sugars
Consult a registered dietitian for personalized advice."""}
    
    elif "sleep" in input_lower:
        return {"response": """Sleep Improvement Strategies:
• Maintain consistent sleep/wake times
• Create a relaxing bedtime routine
• Optimize bedroom environment (cool, dark, quiet)
• Avoid screens 1 hour before bed
• Limit caffeine and heavy meals before bedtime
• Aim for 7-9 hours of quality sleep
Monitor your sleep patterns and consult a sleep specialist if issues persist."""}
    
    elif "stress" in input_lower or "anxiety" in input_lower:
        return {"response": """Stress Management Techniques:
1. Practice deep breathing exercises daily
2. Incorporate regular physical activity
3. Maintain a consistent daily routine
4. Use relaxation techniques or meditation
5. Ensure adequate rest and sleep
6. Connect with supportive people
7. Consider professional counseling if needed
Seek immediate help if stress becomes overwhelming."""}
    
    else:
        return {"response": """General Health Recommendations:
1. Schedule regular check-ups
2. Monitor your health metrics consistently
3. Maintain a balanced lifestyle
4. Document any health changes
5. Follow prescribed treatments
6. Stay active and eat well
7. Get adequate rest and manage stress
8. Seek professional medical advice for specific concerns

Note: This is general guidance. Please consult your healthcare provider for personalized medical advice."""}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        # Log incoming request
        logger.info(f"Processing chat request with input: {request.input[:100]}...")  # Log first 100 chars
        
        # Check if API key is available
        if not GEMINI_API_KEY:
            logger.error("GEMINI_API_KEY not configured")
            return await get_fallback_response(request.input)
            
        # Prepare request to Gemini API with proper prompt engineering
        system_context = "You are an AI health assistant. Provide clear, accurate, and helpful medical information. Always include a disclaimer when appropriate. Focus on evidence-based recommendations."
        full_prompt = f"{system_context}\n\nUser Question: {request.input}"
        
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY,
        }
        
        payload = {
            "contents": [{"parts": [{"text": full_prompt}]}],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 1024,
                "stopSequences": ["User Question:"]  # Prevent model from continuing with new questions
            },
            "safetySettings": [
                {
                    "category": "HARM_CATEGORY_DANGEROUS",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        }

        try:
            # Make request to Gemini API
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    GEMINI_API_URL,
                    headers=headers,
                    json=payload,
                    timeout=30.0
                )
                
                # Retry once if we get an error
                if response.status_code != 200:
                    logger.warning(f"First attempt failed with status {response.status_code}, retrying...")
                    await asyncio.sleep(1)  # Wait 1 second before retry
                    response = await client.post(
                        GEMINI_API_URL,
                        headers=headers,
                        json=payload,
                        timeout=30.0
                    )
                
                if response.status_code != 200:
                    logger.error(f"Gemini API error: {response.text}")
                    return await get_fallback_response(request.input)
                
                # Parse response
                data = response.json()
                if not data.get("candidates"):
                    logger.error("No candidates in Gemini API response")
                    return await get_fallback_response(request.input)
                
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                
                # Post-process the response
                text = text.strip()
                if not text:
                    logger.error("Empty response from Gemini API")
                    return await get_fallback_response(request.input)
                    
                logger.info(f"Successfully generated AI response (length: {len(text)})")
                return {"response": text}
                
        except (httpx.RequestError, httpx.TimeoutException) as e:
            logger.error(f"Network error calling Gemini API: {str(e)}")
            return await get_fallback_response(request.input)
        except Exception as e:
            logger.error(f"Unexpected error calling Gemini API: {str(e)}")
            return await get_fallback_response(request.input)

    except httpx.TimeoutException:
        logger.error("Request to Gemini API timed out")
        raise HTTPException(status_code=504, detail="AI service timeout")
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=12345)