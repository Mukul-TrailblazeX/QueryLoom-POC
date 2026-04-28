import os
import json
import asyncio
import logging
from google import genai
from dotenv import load_dotenv

import spacy

load_dotenv()
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("Gemini-2.5-flash-API")
client = None
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)

# Limit concurrent calls to Gemini to avoid rate limits
kg_semaphore = asyncio.Semaphore(2)

# Load spaCy NLP model (Global definition so it stays in RAM)
try:
    nlp = spacy.load("en_core_web_sm")
    logger.info("Loaded spaCy en_core_web_sm model successfully.")
except OSError:
    logger.warning("en_core_web_sm not found. You must run `python -m spacy download en_core_web_sm`")
    nlp = None

def get_confidence_score(kg_data: dict) -> int:
    """Confidence = number of nodes + 2 * number of edges"""
    return len(kg_data.get("nodes", [])) + 2 * len(kg_data.get("edges", []))

def slugify(text: str) -> str:
    return text.lower().replace(" ", "_").replace("-", "_")

def extract_local_kg(chunk_text: str) -> dict:
    """Extract Knowledge Graph purely CPU-bound using spaCy Pipeline."""
    if not nlp:
        return {"nodes": [], "edges": []}
    
    doc = nlp(chunk_text)
    
    nodes_dict = {}
    edges = []

    # 1. Extract Entities as Nodes
    for ent in doc.ents:
        node_id = slugify(ent.text)
        if node_id not in nodes_dict and len(node_id) > 1:
            nodes_dict[node_id] = {
                "id": node_id,
                "label": ent.label_,
                "properties": {"name": ent.text}
            }

    # 2. Extract Basic Relations (Subject -> Verb -> Object)
    # Using simple Dependency Parsing rules
    for token in doc:
        if token.pos_ == "VERB":
            subjects = [w for w in token.lefts if w.dep_ in ("nsubj", "nsubjpass")]
            objects = [w for w in token.rights if w.dep_ in ("dobj", "pobj", "attr")]
            
            if subjects and objects:
                for subj in subjects:
                    for obj in objects:
                        s_id = slugify(subj.text)
                        o_id = slugify(obj.text)
                        
                        # Only link if they are significant enough to be registered nodes (or register them)
                        if s_id not in nodes_dict and len(s_id) > 1:
                            nodes_dict[s_id] = {"id": s_id, "label": "Concept", "properties": {"name": subj.text}}
                        if o_id not in nodes_dict and len(o_id) > 1:
                            nodes_dict[o_id] = {"id": o_id, "label": "Concept", "properties": {"name": obj.text}}
                            
                        if len(s_id) > 1 and len(o_id) > 1:
                            edges.append({
                                "source_id": s_id,
                                "target_id": o_id,
                                "relation": token.lemma_.upper(),
                                "properties": {"confidence": "medium", "method": "spacy"}
                            })

    return {
        "nodes": list(nodes_dict.values()),
        "edges": edges
    }

def extract_relationships_batch_sync(chunks: list[tuple[int, str]]) -> list[dict]:
    if not client:
        return [{"nodes": [], "edges": []} for _ in chunks]
        
    chunks_text = "\n\n".join([f"Chunk ID: {c[0]}\nText: {c[1]}" for c in chunks])
    
    prompt = f"""
You are an expert Data Extraction System designed to extract Knowledge Graph structures from text.

Analyze the following batches of chunks and extract entities (nodes) and the relationships between them (edges) FOR EACH CHUNK INDEPENDENTLY.

Rules:
- ONLY output a valid JSON Array.
- Return an array of objects. Each object represents the results for one Chunk ID.
- Ensure 'source_id' and 'target_id' exist in the 'nodes' array for that specific chunk.

Required JSON format:
[
  {{
    "chunk_id": (Integer ID exactly as provided),
    "nodes": [
      {{
        "id": "unique_string_id_without_spaces",
        "label": "EntityType",
        "properties": {{"name": "..."}}
      }}
    ],
    "edges": [
      {{
        "source_id": "string_id_from_nodes",
        "target_id": "string_id_from_nodes",
        "relation": "RELATION_TYPE",
        "properties": {{"confidence": "high"}}
      }}
    ]
  }}
]

TEXT CHUNKS DATA:
{chunks_text}
"""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    raw_text = response.text.strip()
    
    if raw_text.startswith("```json"):
        raw_text = raw_text[7:]
    elif raw_text.startswith("```"):
        raw_text = raw_text[3:]
    if raw_text.endswith("```"):
        raw_text = raw_text[:-3]

    try:
        return json.loads(raw_text.strip())
    except json.JSONDecodeError as e:
        logger.error(f"Failed to decode Batch Gemini Output: {e}\n{raw_text}")
        raise ValueError("Invalid JSON from LLM")

async def extract_relationships_batch(batch_chunks: list[tuple[int, str]]) -> list[dict]:
    """Async wrapper around the synchronous Gemini call with retry and exponential backoff, processing a batch."""
    max_retries = 3
    base_delay = 10
    
    for attempt in range(max_retries):
        try:
            async with kg_semaphore:
                return await asyncio.to_thread(extract_relationships_batch_sync, batch_chunks)
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg or "Too Many Requests" in error_msg or "Invalid JSON" in error_msg:
                if attempt < max_retries - 1:
                    sleep_time = base_delay * (2 ** attempt)
                    logger.warning(f"Gemini API rate limit or JSON error hit on Batch. Sleeping for {sleep_time}s before retrying (Attempt {attempt+1}/{max_retries})")
                    await asyncio.sleep(sleep_time)
                    continue
            logger.error(f"Failed to extract relationships for Batch after {attempt+1} attempts: {e}")
            return []
            
    return []

async def extract_kg_concurrently(chunks: list[str]) -> list[dict]:
    """Process chunks concurrently using a Hybrid Local->Cloud Batching pipeline."""
    final_results = [None] * len(chunks)
    low_confidence_chunks = []
    
    # Run Fast Local Extraction first on all chunks (CPU bound, but fast enough to run sequentially)
    logger.info("Running Fast Local Entity Extraction via SpaCy Transformers...")
    for idx, text in enumerate(chunks):
        local_kg = await asyncio.to_thread(extract_local_kg, text)
        score = get_confidence_score(local_kg)
        
        # If SpaCy finds decent amount of info, store it, skip LLM
        if score >= 10:
            final_results[idx] = local_kg
        else:
            low_confidence_chunks.append((idx, text))

    logger.info(f"{len(chunks) - len(low_confidence_chunks)} chunks processed successfully locally.")
    logger.info(f"{len(low_confidence_chunks)} chunks flagged as Low Confidence. Pushing to LLM Batch Engine.")
    
    # Process Low Confidence Chunks in Batches of 10
    batch_size = 10
    llm_tasks = []
    
    for i in range(0, len(low_confidence_chunks), batch_size):
        batch = low_confidence_chunks[i:i + batch_size]
        llm_tasks.append(extract_relationships_batch(batch))
        
    if llm_tasks:
        batch_results_list = await asyncio.gather(*llm_tasks)
        
        # Merge batch results back into the final_results array at correct indices
        for batch_res in batch_results_list:
            for item in batch_res:
                c_id = item.get("chunk_id")
                if c_id is not None and isinstance(c_id, int) and c_id < len(final_results):
                    final_results[c_id] = {
                        "nodes": item.get("nodes", []),
                        "edges": item.get("edges", [])
                    }

    # Ensure no None objects exist (fallbacks)
    for i, res in enumerate(final_results):
        if res is None:
            final_results[i] = {"nodes": [], "edges": []}

    return final_results
