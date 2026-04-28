from pathlib import Path
import json
import re
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
import asyncio
import logging

from app.services.embedding_service import get_embeddings_concurrently
from app.services.kg_extractor import extract_kg_concurrently
from app.services.database import db_layer

logger = logging.getLogger(__name__)

PROCESSED_DIR = Path("storage/processed")
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

# If Tesseract is not in PATH on Windows, set it here:
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def extract_text_from_pdf(pdf_path: str) -> dict:
    import time
    from app.services.image_intelligence import process_image_with_vision_and_gemini

    start_total_extraction = time.time()
    
    doc = fitz.open(pdf_path)
    pages_data = []

    total_text_time = 0
    total_vision_time = 0
    total_gemini_time = 0

    for page_num in range(len(doc)):
        start_page = time.time()
        
        page = doc[page_num]
        
        start_pymupdf = time.time()
        text = page.get_text("text")

        text = clean_text(text)
        total_text_time += (time.time() - start_pymupdf)

        vision_data = None
        
        if len(text) < 50:
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            img_bytes = pix.tobytes("png")
            
            start_tesseract = time.time()
            image = Image.open(io.BytesIO(img_bytes))
            ocr_text = pytesseract.image_to_string(image)
            ocr_text = clean_text(ocr_text)
            total_text_time += (time.time() - start_tesseract)
            
            if len(ocr_text) < 50:
                vision_res = process_image_with_vision_and_gemini(img_bytes)
                vision_data = vision_res["vision_result"]
                total_vision_time += vision_res["vision_time"]
                total_gemini_time += vision_res["gemini_time"]
                
                final_text = vision_data.get("ocr_text", "") or vision_data.get("summary", "")
                extraction_type = "vision_gemini"
            else:
                final_text = ocr_text
                extraction_type = "tesseract_ocr"
        else:
            final_text = text
            extraction_type = "pymupdf_text"

        page_info = {
            "page_number": page_num + 1,
            "extraction_type": extraction_type,
            "text": final_text,
            "processing_time": round(time.time() - start_page, 2)
        }
        
        if vision_data:
            page_info["vision_intelligence"] = vision_data
            
        pages_data.append(page_info)

    doc.close()
    total_time = time.time() - start_total_extraction
    
    return {
        "pages": pages_data,
        "metrics": {
            "text_extraction_time": round(total_text_time, 2),
            "vision_time": round(total_vision_time, 2),
            "gemini_time": round(total_gemini_time, 2),
            "total_extraction_time": round(total_time, 2)
        }
    }

def chunk_text(text: str, chunk_size: int = 1200, overlap: int = 200) -> list[str]:
    text = clean_text(text)
    if not text:
        return []

    chunks = []
    start = 0
    length = len(text)

    while start < length:
        end = min(start + chunk_size, length)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end == length:
            break
        start = max(0, end - overlap)

    return chunks

async def process_pdf_file(pdf_path: str, document_id: str):
    import time
    start_time = time.time()
    
    logger.info(f"Starting processing for file: {pdf_path}")

    # Extract text (Cpu/blocking bound, use to_thread so we don't lock event loop)
    extraction_result = await asyncio.to_thread(extract_text_from_pdf, pdf_path)
    pages_data = extraction_result["pages"]
    metrics = extraction_result["metrics"]

    full_text = "\n".join(
        [f"[Page {p['page_number']}] {p['text']}" for p in pages_data if p["text"]]
    )

    chunks = chunk_text(full_text)
    if not chunks:
        logger.warning(f"No text extracted for document {document_id}")
        return

    metrics["total_time"] = round(time.time() - start_time, 2)
    
    from app.services.document_pipeline import process_and_store_document
    result = await process_and_store_document(
        document_id=document_id,
        source_path=pdf_path,
        chunks=chunks,
        metrics=metrics,
        extra_data={"pages": pages_data}
    )

    return result