import os
import asyncpg
from pgvector.asyncpg import register_vector
import logging
import json
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class DatabaseLayer:
    def __init__(self):
        self.pool = None
        self.dsn = os.getenv("POSTGRES_DSN")

    async def connect(self):
        if not self.dsn or "<YOUR-PASSWORD>" in self.dsn:
            logger.warning("POSTGRES_DSN is not fully configured. Database connection might fail.")

        try:
            # We must handle pgvector registration asynchronously for each connection in the pool
            async def init_connection(conn):
                await conn.execute("CREATE EXTENSION IF NOT EXISTS vector;")
                await register_vector(conn)
                
            self.pool = await asyncpg.create_pool(
                self.dsn,
                min_size=1,
                max_size=10,
                init=init_connection
            )

            await self.init_schema()
            logger.info("Database pool initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")

    async def init_schema(self):
        schema_sql = """
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT,
            type TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS document_chunks (
            id SERIAL PRIMARY KEY,
            document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
            chunk_id INT NOT NULL,
            text TEXT NOT NULL,
            embedding vector(1536),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS kg_nodes (
            id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
            label TEXT NOT NULL,
            properties JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS kg_edges (
            id SERIAL PRIMARY KEY,
            document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
            source_id TEXT REFERENCES kg_nodes(id) ON DELETE CASCADE,
            target_id TEXT REFERENCES kg_nodes(id) ON DELETE CASCADE,
            relation TEXT NOT NULL,
            properties JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Performance Indexes
        CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
        CREATE INDEX IF NOT EXISTS idx_doc_chunks_doc_id ON document_chunks(document_id);
        CREATE INDEX IF NOT EXISTS idx_kg_nodes_doc_id ON kg_nodes(document_id);
        CREATE INDEX IF NOT EXISTS idx_kg_edges_doc_id ON kg_edges(document_id);
        CREATE INDEX IF NOT EXISTS idx_kg_edges_source ON kg_edges(source_id);
        CREATE INDEX IF NOT EXISTS idx_kg_edges_target ON kg_edges(target_id);
        """
        if self.pool:
            async with self.pool.acquire() as conn:
                await conn.execute(schema_sql)

    async def close(self):
        if self.pool:
            await self.pool.close()
            logger.info("Database pool closed.")

    async def insert_document(self, doc_id: str, user_id: str, name: str, doc_type: str):
        if not self.pool: return None
        query = """
        INSERT INTO documents (id, user_id, name, type)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO NOTHING
        """
        try:
            async with self.pool.acquire() as conn:
                await conn.execute(query, doc_id, user_id, name, doc_type)
        except Exception as e:
            logger.error(f"Error inserting document {doc_id}: {e}")

    async def insert_chunk_with_embedding(self, document_id: str, chunk_id: int, text: str, embedding: list[float]):
        if not self.pool: return None
        query = """
        INSERT INTO document_chunks (document_id, chunk_id, text, embedding)
        VALUES ($1, $2, $3, $4)
        """
        try:
            async with self.pool.acquire() as conn:
                await conn.execute(query, document_id, chunk_id, text, embedding)
        except Exception as e:
            logger.error(f"Error inserting chunk embedding: {e}")

    async def insert_kg_node(self, node_id: str, document_id: str, label: str, properties: dict):
        if not self.pool: return None
        query = """
        INSERT INTO kg_nodes (id, document_id, label, properties)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET properties = EXCLUDED.properties
        """
        try:
            async with self.pool.acquire() as conn:
                await conn.execute(query, node_id, document_id, label, json.dumps(properties))
        except Exception as e:
            logger.error(f"Error inserting kg node {node_id}: {e}")

    async def insert_kg_edge(self, source_id: str, target_id: str, document_id: str, relation: str, properties: dict):
        if not self.pool: return None
        query = """
        INSERT INTO kg_edges (source_id, target_id, document_id, relation, properties)
        VALUES ($1, $2, $3, $4, $5)
        """
        try:
            async with self.pool.acquire() as conn:
                # To prevent foreign key constraint errors if node wasn't added properly, 
                # you could ensure node creation or ignore here if constraints are strict
                await conn.execute(query, source_id, target_id, document_id, relation, json.dumps(properties))
        except asyncpg.exceptions.ForeignKeyViolationError:
            logger.warning(f"Ignored hallucinated edge {source_id}->{target_id}. One of these nodes does not exist in the graph.")
        except Exception as e:
            logger.error(f"Error inserting kg edge {source_id}->{target_id}: {e}")

db_layer = DatabaseLayer()
