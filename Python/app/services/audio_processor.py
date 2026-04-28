import logging
import time
import asyncio
import os
from pathlib import Path

# Important: ensure ffmpeg is available
import imageio_ffmpeg

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
ffmpeg_dir = os.path.dirname(ffmpeg_exe)

# Add ffmpeg directory to PATH so whisper can find it regardless of OS
if ffmpeg_dir not in os.environ.get("PATH", ""):
    os.environ["PATH"] += os.pathsep + ffmpeg_dir

import whisper

from app.services.pdf_processor import chunk_text
from app.services.document_pipeline import process_and_store_document

logger = logging.getLogger(__name__)

# To prevent loading model on every request, cache it at module level
_whisper_model = None

def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        logger.info("Loading Whisper 'base' model...")
        _whisper_model = whisper.load_model("base")
    return _whisper_model

async def process_audio_file(audio_path: str, document_id: str):
    start_time = time.time()
    logger.info(f"Starting audio transcribing for file: {audio_path}")

    # Voice transcription is CPU intensive and blocking, must run in thread
    def transcribe():
        model = get_whisper_model()
        return model.transcribe(audio_path)

    transcription_result = await asyncio.to_thread(transcribe)
    full_text = transcription_result.get("text", "").strip()
    
    metrics = {
        "audio_transcription_time": round(time.time() - start_time, 2),
        "language_detected": transcription_result.get("language", "unknown")
    }

    chunks = chunk_text(full_text)
    if not chunks:
        logger.warning(f"No speech extracted for document {document_id}")
        return
        
    metrics["total_time"] = round(time.time() - start_time, 2)

    result = await process_and_store_document(
        document_id=document_id,
        source_path=audio_path,
        chunks=chunks,
        metrics=metrics,
        extra_data={"transcription_segments": transcription_result.get("segments", [])}
    )

    return result
