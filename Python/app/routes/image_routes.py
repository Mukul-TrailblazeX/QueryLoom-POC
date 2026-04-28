from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from pathlib import Path
import shutil
import uuid
import json
import time
from typing import List

from app.services.image_intelligence import process_image_with_vision_and_gemini
from app.services.pdf_processor import chunk_text, PROCESSED_DIR

router = APIRouter(tags=["Image"])

UPLOAD_DIR = Path("storage/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def process_and_save_image(image_path: str, document_id: str):
    start_time = time.time()
    
    with open(image_path, "rb") as f:
        image_bytes = f.read()

    # Process with Vision + Gemini
    vision_res = process_image_with_vision_and_gemini(image_bytes)
    
    vision_data = vision_res["vision_result"]
    text_content = vision_data.get("ocr_text", "") or vision_data.get("summary", "")
    
    # Chunking
    chunks = chunk_text(text_content)
    
    total_time = time.time() - start_time
    
    # Construct standard result JSON compatible with the PDF processor output format
    result = {
        "document_id": document_id,
        "source_file": image_path,
        "metrics": {
            "vision_time": round(vision_res["vision_time"], 2),
            "gemini_time": round(vision_res["gemini_time"], 2),
            "total_extraction_time": round(total_time, 2),
            "total_time": round(total_time, 2)
        },
        "pages": [
            {
                "page_number": 1,
                "extraction_type": "vision_gemini",
                "text": text_content,
                "processing_time": round(total_time, 2),
                "vision_intelligence": vision_data
            }
        ],
        "chunks": [
            {
                "chunk_id": idx + 1,
                "text": chunk
            }
            for idx, chunk in enumerate(chunks)
        ]
    }
    
    output_path = PROCESSED_DIR / f"{document_id}.json"
    with output_path.open("w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

@router.post("/documents/image")
async def upload_image(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...)
):
    responses = []
    
    for file in files:
        filename = file.filename or ""
        valid_extensions = (".jpg", ".jpeg", ".png", ".webp", ".gif")
        if not filename.lower().endswith(valid_extensions) and not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail=f"File {filename} is not a valid image")

        document_id = str(uuid.uuid4())
        # Save the file with extension
        ext = Path(filename).suffix or ".jpg"
        save_path = UPLOAD_DIR / f"{document_id}{ext}"

        with save_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        from app.services.database import db_layer
        # Using a dummy user_id for POC. In production parse from auth token
        await db_layer.insert_document(document_id, "test_user_123", filename, "image")

        background_tasks.add_task(process_and_save_image, str(save_path), document_id)

        responses.append({
            "document_id": document_id,
            "filename": filename,
            "status": "processing"
        })

    return {
        "message": f"{len(files)} images uploaded successfully",
        "documents": responses
    }
