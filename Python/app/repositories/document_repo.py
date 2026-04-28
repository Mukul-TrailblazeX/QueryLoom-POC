import logging
from app.services.database import db_layer

logger = logging.getLogger(__name__)

class DocumentRepository:
    """Handles authorization and filtering of document ownership."""
    
    @staticmethod
    async def get_authorized_document_ids(user_id: str, requested_doc_ids: list[str] = None) -> list[str]:
        """
        Returns authorized document IDs belonging strictly to the user.
        If requested_doc_ids are provided, it only returns the ones the user actually owns.
        Otherwise it returns all the user's documents.
        """
        if not db_layer.pool:
            logger.error("DB Pool not initialized")
            return []

        async with db_layer.pool.acquire() as conn:
            if requested_doc_ids:
                query = "SELECT id FROM documents WHERE user_id = $1 AND id = ANY($2)"
                # asyncpg expects lists for ANY() arrays
                rows = await conn.fetch(query, user_id, requested_doc_ids)
            else:
                query = "SELECT id FROM documents WHERE user_id = $1"
                rows = await conn.fetch(query, user_id)
                
        return [row['id'] for row in rows]
