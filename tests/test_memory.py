import pytest
import tempfile
from pathlib import Path
from contextsync.memory import MemoryEngine

@pytest.mark.asyncio
async def test_memory_engine_lifecycle():
    with tempfile.TemporaryDirectory() as tmpdir:
        vec_path = Path(tmpdir) / "lancedb"
        graph_path = Path(tmpdir) / "graph.db"

        engine = MemoryEngine(
            vector_db_path=vec_path,
            graph_db_path=graph_path,
            api_key=None  # Triggers heuristic & pseudo embedding fallback for offline test
        )

        # 1. Remember knowledge
        item = await engine.remember(
            "Alice leads Project Apollo which uses PostgreSQL and Redis for caching.",
            tags=["architecture", "team"]
        )
        assert item.id is not None
        assert "Alice" in item.content

        # 2. Check stats
        stats = engine.stats()
        assert stats["total_memories"] == 1
        assert stats["entities"] >= 1

        # 3. Recall knowledge
        recall_res = await engine.recall("Who leads Apollo?")
        assert recall_res.query == "Who leads Apollo?"
        assert len(recall_res.memories) == 1
        assert len(recall_res.formatted_context) > 0

        # 4. Forget
        forgot = engine.forget(item.id)
        assert forgot is True
        stats_after = engine.stats()
        assert stats_after["total_memories"] == 0
