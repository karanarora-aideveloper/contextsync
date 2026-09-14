import tempfile
from pathlib import Path
from contextsync.models import Entity, Relation, MemoryItem
from contextsync.store.graph_store import GraphStore
from contextsync.store.vector_store import VectorStore

def test_graph_store_crud():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test_graph.db"
        store = GraphStore(db_path)

        # 1. Upsert entities
        entities = [
            Entity(name="Alice", entity_type="Person", description="Engineering Lead"),
            Entity(name="Cortex", entity_type="Project", description="AI Memory Engine")
        ]
        store.upsert_entities(entities)

        # 2. Add relation
        mem = MemoryItem(content="Alice leads Cortex project.")
        store.save_memory(mem)
        relations = [
            Relation(source="Alice", relation="LEADS", target="Cortex", context="Q1 2026")
        ]
        store.add_relations(relations, memory_id=mem.id)

        # 3. Find connected subgraph
        sub_ents, sub_rels = store.find_connected_subgraph(["Alice"])
        assert len(sub_ents) == 2
        assert len(sub_rels) == 1
        assert sub_rels[0].relation == "LEADS"

        # 4. Check stats
        stats = store.get_stats()
        assert stats["memories"] == 1
        assert stats["entities"] == 2
        assert stats["relations"] == 1

def test_vector_store_crud():
    with tempfile.TemporaryDirectory() as tmpdir:
        vec_path = Path(tmpdir) / "test_lancedb"
        store = VectorStore(vec_path, dimension=4)

        mem1 = MemoryItem(content="React is used for frontend UI.")
        vec1 = [0.1, 0.2, 0.3, 0.4]
        store.add_memory(mem1, vec1)

        mem2 = MemoryItem(content="Postgres is used for SQL storage.")
        vec2 = [0.9, 0.8, 0.7, 0.6]
        store.add_memory(mem2, vec2)

        assert store.count() == 2

        # Search nearest to vec1
        results = store.search([0.11, 0.21, 0.31, 0.41], limit=1)
        assert len(results) == 1
        assert results[0].id == mem1.id
