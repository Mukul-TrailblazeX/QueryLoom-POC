import time
import asyncio
import logging

from app.repositories.query_repo import QueryRepository
from app.services.embedding_service import get_embedding
from app.services.llm_provider import get_llm_provider
# Reuse the same spacy model imported from kg_extractor if available, or just load locally
from app.services.kg_extractor import nlp, slugify

logger = logging.getLogger(__name__)

class QueryEngine:
    @staticmethod
    async def process_hybrid_query(query: str, authorized_doc_ids: list[str]) -> dict:
        start_time = time.time()
        
        # 1. Fetch Embeddings and Entities Concurrently
        async def fetch_vector():
            # Query the fast OpenRouter embedding service (already async)
            try:
                emb = await get_embedding(query)
                return await QueryRepository.vector_search(emb, authorized_doc_ids, limit=5)
            except Exception as e:
                logger.error(f"Vector search failed in fusion: {e}")
                return []
                
        async def fetch_graph():
            # Extract entities from query using CPU-bound spaCy in thread
            def extract_entities():
                if not nlp: return []
                doc = nlp(query)
                entities = set()
                
                # 1. Named Entities (e.g., "Google", "Friday")
                for ent in doc.ents:
                    entities.add(slugify(ent.text))
                    
                # 2. Noun Chunks (e.g., "sample instructions" -> "sample_instructions")
                for chunk in doc.noun_chunks:
                    clean_chunk = " ".join([t.lemma_ for t in chunk if not t.is_stop and not t.is_punct])
                    if len(clean_chunk) > 2:
                        entities.add(slugify(clean_chunk))
                        
                # 3. Solo Nouns and Proper Nouns (Fallback)
                for token in doc:
                    if token.pos_ in ("NOUN", "PROPN") and not token.is_stop and len(token.text) > 2:
                        entities.add(slugify(token.lemma_))
                        
                # Remove empty strings if any
                entities.discard("")
                return list(entities)
                
            query_entities = await asyncio.to_thread(extract_entities)
            
            if not query_entities:
                return []
                
            return await QueryRepository.graph_search(query_entities, authorized_doc_ids, limit=10)

        logger.info(f"Launching hybrid retrieval using docs: {authorized_doc_ids}")
        vector_results, graph_results = await asyncio.gather(fetch_vector(), fetch_graph())
        
        # Context Fusion
        context_string = QueryEngine._build_context(vector_results, graph_results)
        
        # Construct Prompt
        prompt = f"""
You are a highly intelligent and accurate hybrid RAG AI. 
Answer the user's question based strictly on the Context provided. 

Rules:
- If the context does not contain the answer, say "I don't have enough information to answer that."
- Incorporate facts from both Text Chunks and the Knowledge Graph relationships.
- Synthesize the answer fluidly. Do not just list out facts.

--- CONTEXT ---
{context_string}
---------------
USER QUESTION: {query}
"""
        # Call LLM
        llm = get_llm_provider()
        
        # Add basic timeout handling for LLM so requests don't hang infinitely
        try:
            answer = await asyncio.wait_for(llm.generate_answer(prompt), timeout=30.0)
        except asyncio.TimeoutError:
            answer = "Error: The AI model timed out while generating the response."
            
        latency = round((time.time() - start_time) * 1000, 2)
        
        return {
            "answer": answer,
            "sources": {
                "chunks": vector_results,
                "relations": graph_results
            },
            "latency_ms": latency
        }

    @staticmethod
    def _build_context(vector_results: list[dict], graph_results: list[dict]) -> str:
        ctx = "=== TEXT EXTRACTS ===\n"
        for idx, row in enumerate(vector_results):
            ctx += f"[Chunk {idx+1}]: {row.get('text', '')}\n"
            
        ctx += "\n=== KNOWLEDGE GRAPH RELATIONSHIPS ===\n"
        for idx, row in enumerate(graph_results):
            src: str = row.get('source_label', row.get('source_id', ''))
            tgt: str = row.get('target_label', row.get('target_id', ''))
            rel: str = row.get('relation', '')
            ctx += f"- {src} [{rel}] {tgt}\n"
            
        return ctx
