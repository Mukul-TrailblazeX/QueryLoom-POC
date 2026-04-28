from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from pathlib import Path
import shutil
import uuid
from typing import List

from app.services.pdf_processor import process_pdf_file

router = APIRouter(tags=["PDF"])

UPLOAD_DIR = Path("storage/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

#This API is a POST API that is used for Uploading PDFs and processing them in the background
# Accepts a PDF file via a POST request
# Saves the file locally
# Generates a unique ID for it
# Starts processing it asynchronously (in background)
# Immediately returns a response (without waiting for processing)
@router.post("/documents/pdf")
async def upload_pdfs(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...)
):
    responses = []
    
    for file in files:
        filename = file.filename or ""
        if not filename.lower().endswith(".pdf") and file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail=f"File {filename} is not a valid PDF")

        document_id = str(uuid.uuid4())
        save_path = UPLOAD_DIR / f"{document_id}.pdf"

        with save_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        from app.services.database import db_layer
        # Using a dummy user_id for POC. In production parse from auth token
        await db_layer.insert_document(document_id, "test_user_321", filename, "pdf")

        background_tasks.add_task(process_pdf_file, str(save_path), document_id)

        responses.append({
            "document_id": document_id,
            "filename": filename,
            "status": "processing"
        })

    return {
        "message": f"{len(files)} PDFs uploaded successfully",
        "documents": responses
    }