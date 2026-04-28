import logging
import asyncio
import json
from pathlib import Path
from typing import List

from app.services.embedding_service import get_embeddings_concurrently
from app.services.kg_extractor import extract_kg_concurrently
from app.services.database import db_layer
import time

logger = logging.getLogger(__name__)

PROCESSED_DIR = Path("storage/processed")
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

async def process_and_store_document(
    document_id: str, 
    source_path: str,
    chunks: List[str],
    metrics: dict,
    extra_data: dict = None
) -> dict:
    """
    Given a list of text chunks, parallelizes embedding extraction and KG extraction,
    and saves the features to the vector DB + Graph DB.
    """
    
    logger.info(f"Document {document_id} chunked into {len(chunks)} chunks. Processing concurrently...")

    # Spawn async concurrent tasks for ML feature extraction
    embedding_task = get_embeddings_concurrently(chunks)
    kg_task = extract_kg_concurrently(chunks)

    # Await both parallel tasks
    embeddings, kg_results = await asyncio.gather(embedding_task, kg_task)

    # Start persisting chunks, embeddings and KG features to PostgreSQL database
    logger.info(f"Persisting {len(chunks)} embeddings and KG relations to the vector DB for {document_id}...")
    
    # 1. Store chunks with embeddings concurrently 
    db_chunk_tasks = []
    for idx, (chunk_text_data, embedding) in enumerate(zip(chunks, embeddings)):
        db_chunk_tasks.append(
            db_layer.insert_chunk_with_embedding(document_id, idx + 1, chunk_text_data, embedding)
        )
    await asyncio.gather(*db_chunk_tasks)

    # 2. Store KG Entities and Relationships 
    db_node_tasks = []
    db_edge_tasks = []
    # Merge all extracted nodes and edges efficiently
    for kg in kg_results:
        for node in kg.get("nodes", []):
            db_node_tasks.append(db_layer.insert_kg_node(
                node_id=node.get("id"),
                document_id=document_id,
                label=node.get("label", "Entity"),
                properties=node.get("properties", {})
            ))
            
    await asyncio.gather(*db_node_tasks)

    for kg in kg_results:
        for edge in kg.get("edges", []):
            db_edge_tasks.append(db_layer.insert_kg_edge(
                source_id=edge.get("source_id"),
                target_id=edge.get("target_id"),
                document_id=document_id,
                relation=edge.get("relation", "RELATED"),
                properties=edge.get("properties", {})
            ))
            
    await asyncio.gather(*db_edge_tasks)

    logger.info(f"Processing complete for {document_id}")

    # Save original JSON artifact for debugging
    result = {
        "document_id": document_id,
        "source_file": source_path,
        "metrics": metrics,
        "chunks_count": len(chunks)
    }
    
    if extra_data:
        result.update(extra_data)

    output_path = PROCESSED_DIR / f"{document_id}.json"
    with output_path.open("w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    return result
