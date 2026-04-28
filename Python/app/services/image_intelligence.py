import time
import json
import os
from pathlib import Path
from google.cloud import vision
from google.oauth2 import service_account
from google import genai
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Setup GenAI
# Setup GenAI
GEMINI_API_KEY = os.getenv("Gemini-2.5-flash-API")
client = None
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)

# Setup Vision
CREDENTIALS_PATH = Path("CLOUD_CREDENTIALS/vision-api-project-493608-a740d3e4865f.json")
vision_client = None
if CREDENTIALS_PATH.exists():
    credentials = service_account.Credentials.from_service_account_file(str(CREDENTIALS_PATH))
    vision_client = vision.ImageAnnotatorClient(credentials=credentials)

def process_image_with_vision_and_gemini(image_bytes: bytes) -> dict:
    """
    Processes an image using Google Cloud Vision for OCR and Object Detection,
    then uses Gemini to structure the output for a RAG pipeline.
    """
    if not vision_client or not GEMINI_API_KEY:
        raise ValueError("Vision or Gemini API properly configured credentials are missing.")

    start_vision = time.time()
    
    image = vision.Image(content=image_bytes)

    # 1. Vision: Text Detection
    text_response = vision_client.text_detection(image=image)
    full_text = ""
    text_lines = []
    if text_response.text_annotations:
        full_text = text_response.text_annotations[0].description
        text_lines = [t.description for t in text_response.text_annotations]

    # 2. Vision: Object Detection
    object_response = vision_client.object_localization(image=image)
    objects = [
        {"name": obj.name, "confidence": round(obj.score, 2)}
        for obj in object_response.localized_object_annotations
    ]

    vision_result = {
        "full_text": full_text,
        "text_elements": text_lines,
        "objects": objects
    }
    vision_time = time.time() - start_vision

    # 3. Gemini: RAG JSON Formatting
    start_gemini = time.time()
    
    prompt = f"""
You are a data structuring system for RAG pipelines.

Convert the following Vision API output into CLEAN JSON.

Rules:
- Output ONLY valid JSON.
- Make it structured for retrieval (RAG)
- Extract entities like name, ID numbers, course, dates, phone, website if present
- Identify document type (id card, receipt, product, etc.)
- Summarize image meaning in 1 line
- Keep confidence low/medium/high based on clarity

Required output format:
{{
  "document_type": "",
  "summary": "",
  "entities": {{}},
  "objects": [],
  "ocr_text": "",
  "confidence": "low/medium/high"
}}

VISION OUTPUT:
{json.dumps(vision_result, indent=2)}
"""
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=prompt
    )
    raw_text = response.text.strip()
    
    # Strip markdown formatting if any
    if raw_text.startswith("```json"):
        raw_text = raw_text[7:]
    elif raw_text.startswith("```"):
        raw_text = raw_text[3:]
    if raw_text.endswith("```"):
        raw_text = raw_text[:-3]
        
    try:
        gemini_output = json.loads(raw_text.strip())
    except json.JSONDecodeError:
        # Fallback if Gemini fails to output standard JSON
        gemini_output = {
            "document_type": "unknown",
            "summary": "Failed to parse API output.",
            "entities": {},
            "objects": objects,
            "ocr_text": full_text,
            "confidence": "low"
        }

    gemini_time = time.time() - start_gemini

    return {
        "vision_result": gemini_output,
        "vision_time": vision_time,
        "gemini_time": gemini_time,
        "total_time": vision_time + gemini_time
    }
