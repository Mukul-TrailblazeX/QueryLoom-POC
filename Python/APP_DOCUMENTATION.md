# Application Architecture Documentation

Welcome to the documentation for the **Multi-Tenant Hybrid RAG (Retrieval-Augmented Generation) System**. This backend is built to process unstructured data (PDFs, Images), transform it into high-fidelity Knowledge Graphs and Vector embeddings, and query them efficiently across isolated user boundaries.

---

## 🏗️ Core Technology Stack
- **Framework**: FastAPI (Python 3.10+)
- **Database**: PostgreSQL with `pgvector`
- **Database Driver**: `asyncpg` (Fully asynchronous DB pooling)
- **Vector Embeddings**: OpenRouter (`openai/text-embedding-3-small`)
- **LLM/Knowledge Graph Provider**: Google Gemini (`gemini-2.5-flash`)
- **Local NLP Engine**: `spaCy` (`en_core_web_sm`)

---

## ⚙️ System Architecture

### 1. Document Ingestion Pipeline
When a user uploads a document, the application runs a multi-threaded processing pipeline:
1. **Extraction**:
   - *PDFs*: Uses `PyMuPDF` for fast text reading. If the PDF lacks text (scanned), it falls back to `PyTesseract` OCR, and finally the Google Vision API for deep OCR intelligence.
   - *Images*: Uses Google Vision API to extract OCR data and Gemini to structure invoice/receipt details into standard JSON.
2. **Chunking**: The extracted text is standardized and sliced into overlapping chunks (e.g., 1000 characters).
3. **Database Pre-Registration**: The document is registered in the `documents` PostgreSQL table, permanently bounding it to the `user_id`.

### 2. Hybrid AI Processing Pipeline
Once chunked, the system simultaneously runs two parallel tasks per chunk (`asyncio.gather`):
- **Vector Space Translation**: Chunks are sent to OpenRouter in batches to generate 1536-dimensional float vectors via OpenAI's embedding models.
- **Hybrid Knowledge Graph Formulation**: 
  - **Local SpaCy Engine**: CPU-bound `spaCy` analyzes grammar to map Named Entities (Nodes) and Subject-Verb-Object constructs (Edges). If `spaCy`'s confidence score is high enough, it avoids the cloud to save costs.
  - **Gemini Engine**: If a chunk is complex, the system batches multiple text chunks together in a single prompt and asks Gemini to intelligently pull abstract Nodes and Edges.
- **Persistence**: Embeddings and facts are concurrently bulk-inserted into `document_chunks`, `kg_nodes`, and `kg_edges`.

### 3. Secure Query Engine
The query engine implements **strict Document-Level Multi-Tenancy**.
1. **Context Extraction**: The user's query is passed to `spaCy` to identify core Entity Keywords. It is also pushed to OpenRouter to identify Query Embeddings.
2. **PostgreSQL Execution**:
   - *Graph Retrieval*: Finds all 1-hop Edge relationships that involve the query keywords.
   - *Vector Retrieval*: Uses `<=>` cosine similarity operator across `pgvector` chunks.
   - *Security Context*: ALL queries have a strict parameterized WHERE clause: `WHERE document_id = ANY($authorized_docs)`, meaning data leakage between users is mathematically impossible.
3. **LLM Fusion**: Context facts are stitched together into an optimized string and given to the pluggable `LLMProvider` (currently Gemini) for a synthesized answer.

---

## 📁 Directory Structure
- `app/routes/`: FastAPI HTTP endpoint definitions.
- `app/services/`: Core logic orchestration (`query_engine.py`, `pdf_processor.py`, `embedding_service.py`).
- `app/repositories/`: Pure Database execution and validation functions keeping SQL isolated.
- `app/storage/`: Temporary operational storage.
- `CLOUD_CREDENTIALS/`: Google Service accounts.

---

## 🤔 Design Decisions & Tradeoffs
- **PostgreSQL vs GraphDB**: Used relational Postgres for both Vectors and Graphs. This simplifies the infrastructure requirement to a single Supabase instance, keeping deployments cheap, rather than maintaining Pinecone + Neo4J simultaneously.
- **`asyncpg` vs ORM**: Bypassed SQLAlchemy in favor of pure `asyncpg` because `pgvector` optimizations and Bulk Inserts operate significantly faster directly near the metal.
