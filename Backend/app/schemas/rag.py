from typing import Any

from pydantic import BaseModel, Field


class RagQueryRequest(BaseModel):
    query: str = Field(min_length=1)
    top_k: int = Field(default=5, ge=1, le=20)
    filters: dict[str, Any] = Field(default_factory=dict)


class RagQueryResponse(BaseModel):
    answer: str
    sources: list[dict[str, Any]]
    debug: dict[str, Any]


class RagIngestRequest(BaseModel):
    source_type: str = Field(description="file | url | text")
    payload: dict[str, Any]


class RagJobResponse(BaseModel):
    job_id: str
    status: str
    message: str
