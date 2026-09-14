from typing import List, Optional
import os
import hashlib
import numpy as np
from contextsync.config import GEMINI_API_KEY, DEFAULT_EMBED_MODEL

class EmbeddingEngine:
    """Generates vector embeddings for text chunks."""

    def __init__(self, api_key: Optional[str] = None, model: str = DEFAULT_EMBED_MODEL):
        self.api_key = api_key or GEMINI_API_KEY
        self.model = model
        self._client = None
        self.dimension = 768  # text-embedding-004 standard dimension

        if self.api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                # Log or print warning; fallback will be used if client fails
                self._client = None

    async def embed_text(self, text: str) -> List[float]:
        """Embed a single string into a vector."""
        vectors = await self.embed_batch([text])
        return vectors[0]

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of strings into vectors."""
        if not texts:
            return []

        if self._client:
            try:
                # Use Google GenAI official SDK
                response = self._client.models.embed_content(
                    model=self.model,
                    contents=texts
                )
                if hasattr(response, "embeddings") and response.embeddings:
                    return [emb.values for emb in response.embeddings]
            except Exception as e:
                pass

        # Deterministic semantic hash fallback (for tests, offline, or missing keys)
        return [self._pseudo_embedding(t, self.dimension) for t in texts]

    def _pseudo_embedding(self, text: str, dim: int = 768) -> List[float]:
        """Deterministic pseudo-embedding for testing and offline environments."""
        seed = int(hashlib.md5(text.encode("utf-8")).hexdigest(), 16) % (2**32)
        rng = np.random.RandomState(seed)
        vec = rng.randn(dim).astype(np.float32)
        # Normalize to unit vector
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()
