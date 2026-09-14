from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from contextsync.memory import MemoryEngine
from contextsync import __version__

app = FastAPI(
    title="ContextSync Cloud API",
    description="REST API for ContextSync (contextsync.dev) - Persistent Long-Term Memory Engine",
    version=__version__
)

# Enable CORS for local web dashboard and production domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = MemoryEngine()

# Pydantic Schemas for API Requests
class RememberRequest(BaseModel):
    content: str = Field(..., description="The text, code rule, or knowledge to store")
    tags: Optional[List[str]] = Field(default_factory=list, description="Optional tags")

class RecallRequest(BaseModel):
    query: str = Field(..., description="Question or concept to search")
    limit: Optional[int] = Field(default=5, ge=1, le=50)

class ForgetResponse(BaseModel):
    success: bool
    message: str

@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "version": __version__, "service": "ContextSync API"}

@app.get("/api/stats")
def get_stats():
    """Return memory counts and graph metrics."""
    return engine.stats()

@app.get("/api/memories")
def list_memories(limit: int = 100, offset: int = 0):
    """List stored memories with pagination."""
    memories = engine.graph_store.get_all_memories(limit=limit, offset=offset)
    return {"memories": memories, "total": len(memories)}

@app.post("/api/memories", status_code=status.HTTP_201_CREATED)
async def create_memory(req: RememberRequest):
    """Add a new memory item and extract into Knowledge Graph."""
    if not req.content.strip():
        raise HTTPException(status_code=400, detail="Memory content cannot be empty")
    item = await engine.remember(content=req.content, tags=req.tags, source="api")
    return {"success": True, "memory": item}

@app.delete("/api/memories/{memory_id}")
def delete_memory(memory_id: str):
    """Delete a memory by its unique ID."""
    success = engine.forget(memory_id)
    if not success:
        raise HTTPException(status_code=404, detail="Memory not found")
    return {"success": True, "deleted_id": memory_id}

@app.post("/api/recall")
async def recall_memory(req: RecallRequest):
    """Retrieve memories using hybrid vector + graph traversal."""
    result = await engine.recall(query=req.query, limit=req.limit or 5)
    return {
        "query": result.query,
        "memories": result.memories,
        "entities": result.entities,
        "relations": result.relations,
        "formatted_context": result.formatted_context
    }

@app.get("/api/graph")
def get_graph():
    """Return all entities (nodes) and relations (links) for the interactive mindmap visualizer."""
    return engine.graph_store.get_full_graph()
