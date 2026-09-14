from typing import Optional
import json
import re
from contextsync.models import ExtractionResult, Entity, Relation
from contextsync.config import GEMINI_API_KEY, DEFAULT_LLM_MODEL

EXTRACTION_SYSTEM_PROMPT = """You are Cortex, an expert knowledge graph and memory extraction engine.
Your task is to analyze the input text and extract key knowledge components:
1. Entities: Named concepts, technologies, people, projects, rules, preferences, or architecture components.
2. Relationships: Directed connections between these entities (e.g., 'Alice' -> 'MANAGES' -> 'Project Apollo', 'Project Apollo' -> 'USES' -> 'PostgreSQL').
3. Summary: A single crisp sentence distilling the core takeaway.

Be precise, omit fluff, and normalize entity names (use standard casing)."""

class KnowledgeExtractor:
    """Extracts entities and relationships from text using Gemini 2.0 Flash or heuristic fallback."""

    def __init__(self, api_key: Optional[str] = None, model: str = DEFAULT_LLM_MODEL):
        self.api_key = api_key or GEMINI_API_KEY
        self.model = model
        self._client = None

        if self.api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except Exception:
                self._client = None

    async def extract(self, text: str) -> ExtractionResult:
        """Extract entities and relations from text."""
        if not text or not text.strip():
            return ExtractionResult()

        if self._client:
            try:
                from google.genai import types
                prompt = f"{EXTRACTION_SYSTEM_PROMPT}\n\nInput text to extract:\n\"\"\"\n{text}\n\"\"\""
                response = self._client.models.generate_content(
                    model=self.model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=ExtractionResult,
                        temperature=0.1,
                    )
                )
                if response.parsed:
                    return response.parsed
                elif response.text:
                    data = json.loads(response.text)
                    return ExtractionResult(**data)
            except Exception as e:
                # If API call fails or quota exceeded, fall through to heuristic extractor
                pass

        # Heuristic / Rule-based fallback extractor for offline/mock mode
        return self._heuristic_extract(text)

    def _heuristic_extract(self, text: str) -> ExtractionResult:
        """Heuristic fallback for offline, testing, or API-free use."""
        entities = []
        relations = []
        
        # Simple entity detection based on capitalized words and key patterns
        words = re.findall(r'\b[A-Z][a-zA-Z0-9_-]+\b', text)
        unique_words = list(dict.fromkeys(words))

        for word in unique_words[:6]:
            entities.append(Entity(name=word, entity_type="Concept", description=f"Extracted concept: {word}"))

        if len(entities) >= 2:
            relations.append(Relation(
                source=entities[0].name,
                relation="ASSOCIATED_WITH",
                target=entities[1].name,
                context=text[:100]
            ))

        summary = text.strip().split(".")[0] if "." in text else text[:80]
        return ExtractionResult(entities=entities, relations=relations, summary=summary)
