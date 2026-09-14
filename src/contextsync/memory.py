from typing import List, Optional, Dict, Any
from pathlib import Path
from contextsync.models import MemoryItem, RecallResult, Entity, Relation
from contextsync.embeddings import EmbeddingEngine
from contextsync.extractor import KnowledgeExtractor
from contextsync.store.vector_store import VectorStore
from contextsync.store.graph_store import GraphStore
from contextsync.config import (
    VECTOR_DB_DIR,
    GRAPH_DB_PATH,
    GEMINI_API_KEY,
    DEFAULT_LLM_MODEL,
    DEFAULT_EMBED_MODEL
)

class MemoryEngine:
    """The central Memory Engine orchestrating extraction, graph storage, and vector retrieval."""

    def __init__(
        self,
        vector_db_path: Path = VECTOR_DB_DIR,
        graph_db_path: Path = GRAPH_DB_PATH,
        api_key: Optional[str] = None,
        llm_model: str = DEFAULT_LLM_MODEL,
        embed_model: str = DEFAULT_EMBED_MODEL
    ):
        self.api_key = api_key or GEMINI_API_KEY
        self.embedding_engine = EmbeddingEngine(api_key=self.api_key, model=embed_model)
        self.extractor = KnowledgeExtractor(api_key=self.api_key, model=llm_model)
        self.vector_store = VectorStore(db_path=vector_db_path, dimension=self.embedding_engine.dimension)
        self.graph_store = GraphStore(db_path=graph_db_path)

    async def remember(
        self,
        content: str,
        tags: Optional[List[str]] = None,
        source: Optional[str] = "user",
        user_id: str = "local"
    ) -> MemoryItem:
        """Store knowledge, extract entities/relations into graph, and embed into vector space."""
        if not content or not content.strip():
            raise ValueError("Memory content cannot be empty.")

        tags = tags or []

        # 1. Extract entities, relations, and summary
        extraction = await self.extractor.extract(content)

        # Apply user_id to all extracted entities and relations
        for entity in extraction.entities:
            entity.user_id = user_id
        for relation in extraction.relations:
            relation.user_id = user_id

        # 2. Create memory item
        item = MemoryItem(
            user_id=user_id,
            content=content.strip(),
            summary=extraction.summary,
            tags=tags,
            source=source
        )

        # 3. Generate embedding vector
        text_to_embed = f"{item.summary or ''} {item.content}".strip()
        vector = await self.embedding_engine.embed_text(text_to_embed)

        # 4. Save to Vector Store
        self.vector_store.add_memory(item, vector)

        # 5. Save to Graph Store
        self.graph_store.save_memory(item)
        if extraction.entities:
            self.graph_store.upsert_entities(extraction.entities)
        if extraction.relations:
            self.graph_store.add_relations(extraction.relations, memory_id=item.id)

        return item

    async def recall(self, query: str, limit: int = 5, user_id: str = "local") -> RecallResult:
        """Recall relevant memories using hybrid vector similarity and knowledge graph traversal."""
        if not query or not query.strip():
            return RecallResult(query=query)

        # 1. Vector similarity search
        query_vector = await self.embedding_engine.embed_text(query)
        matched_memories = self.vector_store.search(query_vector, user_id=user_id, limit=limit)

        # 2. Identify relevant entities from query + top memories
        entity_candidates = self.graph_store.search_entities_by_text(query, user_id=user_id)
        for mem in matched_memories[:2]:
            extracted_from_mem = self.graph_store.search_entities_by_text(mem.content, user_id=user_id)
            for ent in extracted_from_mem:
                if ent.name not in [e.name for e in entity_candidates]:
                    entity_candidates.append(ent)

        entity_names = [e.name for e in entity_candidates[:6]]

        # 3. Traverse knowledge graph around these entities
        connected_entities, connected_relations = self.graph_store.find_connected_subgraph(entity_names, user_id=user_id)

        # 4. Synthesize markdown context block for LLM consumption
        context_parts = []
        if matched_memories:
            context_parts.append("### Relevant Memories:")
            for idx, m in enumerate(matched_memories, 1):
                summary_text = f" ({m.summary})" if m.summary else ""
                context_parts.append(f"{idx}. {m.content}{summary_text}")

        if connected_relations:
            context_parts.append("\n### Connected Knowledge Graph:")
            for r in connected_relations:
                ctx = f" ({r.context})" if r.context else ""
                context_parts.append(f"- **{r.source}** -> *{r.relation}* -> **{r.target}**{ctx}")
        elif connected_entities:
            context_parts.append("\n### Known Entities:")
            for e in connected_entities:
                desc = f": {e.description}" if e.description else ""
                context_parts.append(f"- **{e.name}** ({e.entity_type}){desc}")

        formatted_context = "\n".join(context_parts)

        return RecallResult(
            query=query,
            memories=matched_memories,
            entities=connected_entities,
            relations=connected_relations,
            formatted_context=formatted_context
        )

    def forget(self, memory_id: str, user_id: str = "local") -> bool:
        """Forget a memory item by ID."""
        vec_ok = self.vector_store.delete(memory_id, user_id=user_id)
        graph_ok = self.graph_store.delete_memory(memory_id, user_id=user_id)
        return vec_ok or graph_ok

    def stats(self, user_id: str = "local") -> Dict[str, Any]:
        """Return memory engine statistics."""
        graph_stats = self.graph_store.get_stats(user_id=user_id)
        return {
            "total_memories": graph_stats["memories"],
            "entities": graph_stats["entities"],
            "relations": graph_stats["relations"],
        }
