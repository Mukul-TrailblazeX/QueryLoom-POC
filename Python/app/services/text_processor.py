import logging
import time
import asyncio
from pathlib import Path
from app.services.pdf_processor import chunk_text # Reusing the clean chunking from pdf
from app.services.document_pipeline import process_and_store_document

logger = logging.getLogger(__name__)

async def process_text_file(text_path: str, document_id: str):
    start_time = time.time()
    logger.info(f"Starting processing for file: {text_path}")

    # Read the text file
    def read_text():
        with open(text_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()

    full_text = await asyncio.to_thread(read_text)
    
    metrics = {
        "text_extraction_time": round(time.time() - start_time, 2)
    }

    chunks = chunk_text(full_text)
    if not chunks:
        logger.warning(f"No text found for document {document_id}")
        return
        
    metrics["total_time"] = round(time.time() - start_time, 2)

    result = await process_and_store_document(
        document_id=document_id,
        source_path=text_path,
        chunks=chunks,
        metrics=metrics
    )

    return result
