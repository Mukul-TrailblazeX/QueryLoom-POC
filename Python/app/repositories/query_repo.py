import logging
import json
from app.services.database import db_layer

logger = logging.getLogger(__name__)

class QueryRepository:
    """Performs isolated DB queries using PostgreSQL and pgvector."""

    @staticmethod
    async def vector_search(query_embedding: list[float], authorized_doc_ids: list[str], limit: int = 5) -> list[dict]:
        """
        Retrieves the top-k most similar text chunks using cosine distance (<=>).
        Strictly bounded by authorized_docs_ids.
        """
        if not db_layer.pool or not authorized_doc_ids:
            return []

        query = """
        SELECT document_id, chunk_id, text, (embedding <=> $1) AS distance
        FROM document_chunks
        WHERE document_id = ANY($2)
        ORDER BY distance ASC
        LIMIT $3
        """
        try:
            async with db_layer.pool.acquire() as conn:
                rows = await conn.fetch(query, query_embedding, authorized_doc_ids, limit)
                return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"Vector search failed: {e}")
            return []

    @staticmethod
    async def graph_search(entity_ids: list[str], authorized_doc_ids: list[str], limit: int = 15) -> list[dict]:
        """
        Retrieves 1-hop edge traversal (src -> edge -> tgt) matching the recognized query entities.
        Strictly bounded by authorized_docs_ids.
        """
        if not db_layer.pool or not authorized_doc_ids or not entity_ids:
            return []

        query = """
        SELECT e.relation, e.properties as edge_props,
               src.id as source_id, src.label as source_label, src.properties as source_props,
               tgt.id as target_id, tgt.label as target_label, tgt.properties as target_props
        FROM kg_edges e
        JOIN kg_nodes src ON e.source_id = src.id
        JOIN kg_nodes tgt ON e.target_id = tgt.id
        WHERE e.document_id = ANY($1) 
          AND (e.source_id = ANY($2) OR e.target_id = ANY($2))
        LIMIT $3
        """
        try:
            async with db_layer.pool.acquire() as conn:
                rows = await conn.fetch(query, authorized_doc_ids, entity_ids, limit)
                results = []
                for row in rows:
                    res = dict(row)
                    # DB jsonb fields might return strings that need mapping or are already dicts in asyncpg
                    if isinstance(res.get('edge_props'), str): res['edge_props'] = json.loads(res['edge_props'])
                    if isinstance(res.get('source_props'), str): res['source_props'] = json.loads(res['source_props'])
                    if isinstance(res.get('target_props'), str): res['target_props'] = json.loads(res['target_props'])
                    results.append(res)
                return results
        except Exception as e:
            logger.error(f"Graph search failed: {e}")
            return []
