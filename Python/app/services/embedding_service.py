import os
import asyncio
from openai import AsyncOpenAI
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

env = os.getenv("ENVIRONMENT", "testing").lower()

if env == "testing":
    base_url = "https://openrouter.ai/api/v1"
    api_key = os.getenv("OPENROUTER_API_KEY")
    # For OpenRouter we request the openai model
    default_model = "openai/text-embedding-3-small"
else:
    base_url = None # Default OpenAI
    api_key = os.getenv("OPENAI_API_KEY")
    default_model = "text-embedding-3-small"

client = AsyncOpenAI(api_key=api_key, base_url=base_url)

# Concurrency limiting for safe batch execution
# Limits to 10 concurrent requests to OpenRouter/OpenAI
semaphore = asyncio.Semaphore(10)

async def get_embedding(text: str, model: str = default_model) -> list[float]:
    async with semaphore:
        try:
            response = await client.embeddings.create(input=[text], model=model)
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error fetching embedding for text chunk: {e}")
            # return zero vector as fallback or raise? Returning empty to fail gracefully
            return []

async def get_embeddings_concurrently(chunks: list[str], model: str = default_model) -> list[list[float]]:
    """
    Process multiple chunks concurrently but safely.
    """
    tasks = [get_embedding(chunk, model=model) for chunk in chunks]
    embeddings = await asyncio.gather(*tasks)
    return embeddings
