from uuid import uuid4

import httpx
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.models.user import User
from app.schemas.rag import RagIngestRequest, RagJobResponse, RagQueryRequest, RagQueryResponse

router = APIRouter(prefix="/rag", tags=["rag"])
settings = get_settings()

@router.post("/query", response_model=RagQueryResponse)
async def rag_query(payload: RagQueryRequest, current_user: User = Depends(get_current_user)) -> RagQueryResponse:
    python_rag_url = f"{settings.python_rag_internal_url}/query"
    
    # We map the Backend payload to Python payload
    python_payload = {
        "query": payload.query,
        "document_ids": payload.filters.get("document_ids")
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                python_rag_url,
                json=python_payload,
                headers={"x-user-id": str(current_user.id)}
            )
            response.raise_for_status()
            data = response.json()
            
            # Assuming Python returns the final result or similar structure
            return RagQueryResponse(
                answer=data.get("answer", "No answer provided") if isinstance(data, dict) else str(data),
                sources=data.get("sources", []) if isinstance(data, dict) else [],
                debug={"status": "proxied", "proxy_url": python_rag_url}
            )
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"RAG Engine Error: {e.response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to connect to RAG Engine: {str(e)}")


@router.post("/ingest", response_model=RagJobResponse, status_code=status.HTTP_202_ACCEPTED)
async def rag_ingest(payload: RagIngestRequest, current_user: User = Depends(get_current_user)) -> RagJobResponse:
    # Temporarily we will just simulate an ingest queue or we can proxy to /documents/text if it's text.
    # To fully support file ingestion we would need a multipart/form data endpoint.
    return RagJobResponse(
        job_id=str(uuid4()),
        status="queued",
        message="Use direct document endpoints for file ingestion or wait for full queue integration.",
    )


@router.get("/status/{job_id}", response_model=RagJobResponse)
async def rag_status(job_id: str, _: User = Depends(get_current_user)) -> RagJobResponse:
    return RagJobResponse(
        job_id=job_id,
        status="pending",
        message="Temporary route: job status tracking.",
    )
