from typing import List, Optional
import asyncio
from mcp.server.mcpserver import MCPServer
from contextsync.memory import MemoryEngine
import os
from contextsync.store.user_store import UserStore
from contextsync.config import CORTEX_DATA_DIR

server = MCPServer(
    name="contextsync",
    instructions="ContextSync (contextsync.dev) is a persistent long-term memory engine with hybrid Knowledge Graph + Vector search."
)

_engine: Optional[MemoryEngine] = None


_user_id: Optional[str] = None

def get_current_user_id() -> str:
    global _user_id
    if _user_id is None:
        api_key = os.getenv("CONTEXTSYNC_API_KEY")
        if api_key:
            store = UserStore(CORTEX_DATA_DIR / "users.db")
            user = store.get_by_api_key(api_key)
            if user:
                _user_id = user["id"]
        if not _user_id:
            _user_id = "local" # Fallback for pure local usage without API keys
    return _user_id

def get_engine() -> MemoryEngine:
    global _engine
    if _engine is None:
        _engine = MemoryEngine()
    return _engine

@server.tool(
    name="remember",
    description="Store durable facts, user preferences, codebase rules, or architectural decisions into long-term memory."
)
async def remember(content: str, tags: Optional[List[str]] = None) -> str:
    """Store a memory into the Knowledge Graph and Vector Database."""
    engine = get_engine()
    item = await engine.remember(content=content, tags=tags or [], source="mcp", user_id=get_current_user_id())
    summary = f" Summary: {item.summary}" if item.summary else ""
    return f"Memory stored successfully (ID: {item.id}).{summary}"

@server.tool(
    name="recall",
    description="Search and retrieve relevant long-term memories and connected knowledge graph context."
)
async def recall(query: str, limit: int = 5) -> str:
    """Query long-term memory by concept, rule, or entity."""
    engine = get_engine()
    res = await engine.recall(query=query, limit=limit, user_id=get_current_user_id())
    if not res.memories and not res.entities:
        return f"No memories found matching query: '{query}'"
    return res.formatted_context

@server.tool(
    name="forget",
    description="Delete a specific memory by its ID."
)
async def forget(memory_id: str) -> str:
    """Remove a memory item from storage."""
    engine = get_engine()
    success = engine.forget(memory_id, user_id=get_current_user_id())
    if success:
        return f"Memory {memory_id} deleted successfully."
    return f"Memory {memory_id} not found."

@server.tool(
    name="memory_stats",
    description="Get statistics about stored memories, entities, and relationships."
)
async def memory_stats() -> str:
    """Check total stored memories and knowledge graph size."""
    engine = get_engine()
    s = engine.stats(user_id=get_current_user_id())
    return f"Memories: {s['total_memories']} | Entities: {s['entities']} | Relations: {s['relations']}"

def run_stdio():
    """Run the MCP server over standard I/O (for Cursor, Claude Code, etc.)."""
    asyncio.run(server.run_stdio_async())

if __name__ == "__main__":
    run_stdio()
