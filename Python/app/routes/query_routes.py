from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List

from app.repositories.document_repo import DocumentRepository
from app.services.query_engine import QueryEngine

router = APIRouter(tags=["Query Engine"])

class QueryRequest(BaseModel):
    query: str
    document_ids: Optional[List[str]] = None

# Simple middleware simulator: usually injected via Bearer Auth tokens
def get_current_user(x_user_id: str = Header(default="test_user_123", description="Simulates Authenticated User ID")):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID Header missing")
    return x_user_id

@router.post("/query")
async def execute_query(
    request: QueryRequest,
    user_id: str = Depends(get_current_user)
):
    """
    Executes a Hybrid RAG Query.
    Forces strict Multi-Tenant isolation by restricting retrieval strictly to document_ids owned by the user_id.
    """
    # 1. Authorize requested boundaries
    authorized_docs = await DocumentRepository.get_authorized_document_ids(
        user_id=user_id, 
        requested_doc_ids=request.document_ids
    )

    if not authorized_docs:
        raise HTTPException(status_code=404, detail="No accessible documents found matching the requested scope.")

    # 2. Run highly secured Query Engine
    result = await QueryEngine.process_hybrid_query(request.query, authorized_docs)
    
    return result
