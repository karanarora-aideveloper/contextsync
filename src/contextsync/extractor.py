from typing import Optional
import json
import re
from contextsync.models import ExtractionResult, Entity, Relation
from contextsync.config import GEMINI_API_KEY, DEEPSEEK_API_KEY, DEFAULT_LLM_MODEL

EXTRACTION_SYSTEM_PROMPT = """You are Cortex, an expert knowledge graph and memory extraction engine.
Your task is to analyze the input text and extract key knowledge components:
1. Entities: Named concepts, technologies, people, projects, rules, preferences, or architecture components.
2. Relationships: Directed connections between these entities (e.g., 'Alice' -> 'MANAGES' -> 'Project Apollo', 'Project Apollo' -> 'USES' -> 'PostgreSQL').
3. Summary: A single crisp sentence distilling the core takeaway.

CRITICAL INSTRUCTIONS:
- Be precise, omit fluff, and normalize entity names (use standard casing).
- DO NOT split compound nouns, branded terms, or tightly coupled product names. For example, extract "Google Antigravity" as a single entity, not "Google" and "Antigravity". Extract "Visual Studio Code" as one entity, not "Visual Studio" and "Code".
- Keep entities meaningful and atomic but structurally intact."""

class KnowledgeExtractor:
    """Extracts entities and relationships from text using DeepSeek, Gemini, or fallback."""

    def __init__(self, api_key: Optional[str] = None, model: str = DEFAULT_LLM_MODEL):
        self.api_key = api_key or GEMINI_API_KEY
        self.deepseek_key = DEEPSEEK_API_KEY
        self.model = model
        
        self._gemini_client = None
        self._openai_client = None

        if self.deepseek_key:
            try:
                from openai import AsyncOpenAI
                self._openai_client = AsyncOpenAI(api_key=self.deepseek_key, base_url="https://api.deepseek.com/v1")
            except Exception:
                pass
                
        if self.api_key and not self._openai_client:
            try:
                from google import genai
                self._gemini_client = genai.Client(api_key=self.api_key)
            except Exception:
                pass

    async def extract(self, text: str) -> ExtractionResult:
        """Extract entities and relations from text."""
        if not text or not text.strip():
            return ExtractionResult()

        if self._openai_client:
            try:
                schema = ExtractionResult.model_json_schema()
                prompt = f"{EXTRACTION_SYSTEM_PROMPT}\n\nInput text to extract:\n\"\"\"\n{text}\n\"\"\"\n\nRespond ONLY with a valid JSON object matching exactly this JSON schema:\n{json.dumps(schema)}"
                response = await self._openai_client.chat.completions.create(
                    model="deepseek-chat",
                    messages=[
                        {"role": "system", "content": prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.1
                )
                
                content = response.choices[0].message.content
                data = json.loads(content)
                
                # DeepSeek might wrap the response in the schema properties directly or in a root key
                # So we ensure it maps to ExtractionResult
                return ExtractionResult(**data)
            except Exception as e:
                # Fallback to heuristic
                print(f"DeepSeek extraction error: {e}")
                pass

        if self._gemini_client:
            try:
                from google.genai import types
                prompt = f"{EXTRACTION_SYSTEM_PROMPT}\n\nInput text to extract:\n\"\"\"\n{text}\n\"\"\""
                response = self._gemini_client.models.generate_content(
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
