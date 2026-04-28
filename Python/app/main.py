import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.routes.pdf_routes import router as pdf_router
from app.routes.image_routes import router as image_router
from app.routes.query_routes import router as query_router
from app.routes.text_routes import router as text_router
from app.routes.audio_routes import router as audio_router
from app.services.database import db_layer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    logger.info("Application starting up... initializing database connections.")
    await db_layer.connect()
    yield
    # Shutdown logic
    logger.info("Application shutting down... closing database pool.")
    await db_layer.close()

app = FastAPI(title="RAG POC API", version="0.1.0", lifespan=lifespan)

app.include_router(pdf_router, prefix="/api/v1")
app.include_router(image_router, prefix="/api/v1")
app.include_router(query_router, prefix="/api/v1")
app.include_router(text_router, prefix="/api/v1")
app.include_router(audio_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "RAG POC API is running. Access the API's Web View at /docs"}