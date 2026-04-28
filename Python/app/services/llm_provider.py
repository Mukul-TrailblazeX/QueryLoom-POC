import os
import logging
import asyncio
from typing import Protocol

from google import genai
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

class LLMProvider(Protocol):
    async def generate_answer(self, prompt: str) -> str:
        pass

class GeminiProvider:
    """Implement LLM wrapper for Google's Gemini."""
    def __init__(self):
        self.api_key = os.getenv("Gemini-2.5-flash-API")
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None

    async def generate_answer(self, prompt: str) -> str:
        if not self.client:
            logger.error("Gemini API Key missing.")
            return "Configuration Error: LLM Provider offline."

        try:
            # Execute synchronous client in thread
            response = await asyncio.to_thread(
                self.client.models.generate_content,
                model="gemini-2.5-flash",
                contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini generation error: {e}")
            return f"Error generating answer: {str(e)}"

class OpenRouterProvider:
    """Implement LLM wrapper for OpenAI/OpenRouter."""
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=os.getenv("OPENROUTER_API_KEY"),
            base_url="https://openrouter.ai/api/v1"
        )
        
    async def generate_answer(self, prompt: str) -> str:
        try:
            response = await self.client.chat.completions.create(
                model="openai/gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"OpenRouter generation error: {e}")
            return f"Error generating answer: {str(e)}"

# Factory function to swap providers easily
def get_llm_provider() -> LLMProvider:
    # return OpenRouterProvider() # Easily pluggable
    return GeminiProvider()
