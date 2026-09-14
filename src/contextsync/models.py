from __future__ import annotations
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import uuid
from pydantic import BaseModel, Field


class Entity(BaseModel):
    """An entity (node) in the knowledge graph."""
    name: str = Field(description="Name of the entity, e.g. 'Project Apollo', 'Alice', 'PostgreSQL'")
    entity_type: str = Field(
        default="Concept",
        description="Type of entity: Person, Project, TechStack, Rule, Architecture, Preference, Concept"
    )
    description: Optional[str] = Field(default=None, description="Short summary of what this entity is or does")
    metadata: Dict[str, Any] = Field(default_factory=dict)
    user_id: str = Field(default="local", description="Tenant ID to isolate data")


class Relation(BaseModel):
    """A directed edge between two entities in the knowledge graph."""
    source: str = Field(description="Source entity name")
    relation: str = Field(description="Relationship label, e.g. 'USES', 'MANAGES', 'DEPENDS_ON', 'PREFERS'")
    target: str = Field(description="Target entity name")
    context: Optional[str] = Field(default=None, description="Context or reason for this relationship")
    user_id: str = Field(default="local", description="Tenant ID to isolate data")


class ExtractionResult(BaseModel):
    """Structured output returned by the LLM extraction step."""
    entities: List[Entity] = Field(default_factory=list, description="List of extracted entities")
    relations: List[Relation] = Field(default_factory=list, description="List of relationships connecting entities")
    summary: Optional[str] = Field(default=None, description="Concise 1-sentence distillation of the memory")


class MemoryItem(BaseModel):
    """A stored memory entry in the vector store and registry."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = Field(default="local", description="Tenant ID to isolate data")
    content: str
    summary: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    tags: List[str] = Field(default_factory=list)
    source: Optional[str] = "user"
    score: Optional[float] = None


class RecallResult(BaseModel):
    """Comprehensive result returned from a recall query."""
    query: str
    memories: List[MemoryItem] = Field(default_factory=list)
    entities: List[Entity] = Field(default_factory=list)
    relations: List[Relation] = Field(default_factory=list)
    formatted_context: str = ""
