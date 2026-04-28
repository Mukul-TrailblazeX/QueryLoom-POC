from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from pathlib import Path
import shutil
import uuid
from typing import List

from app.services.text_processor import process_text_file

router = APIRouter(tags=["Text"])

UPLOAD_DIR = Path("storage/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/documents/text")
async def upload_texts(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...)
):
    responses = []
    
    for file in files:
        filename = file.filename or ""
        
        document_id = str(uuid.uuid4())
        # Use safe extension or fallback to .txt
        ext = Path(filename).suffix if Path(filename).suffix else ".txt"
        save_path = UPLOAD_DIR / f"{document_id}{ext}"

        with save_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        from app.services.database import db_layer
        # Using a dummy user_id for POC.
        await db_layer.insert_document(document_id, "test_user_321", filename, "text")

        background_tasks.add_task(process_text_file, str(save_path), document_id)

        responses.append({
            "document_id": document_id,
            "filename": filename,
            "status": "processing"
        })

    return {
        "message": f"{len(files)} text files uploaded successfully",
        "documents": responses
    }
