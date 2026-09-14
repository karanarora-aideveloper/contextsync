from contextsync.models import Entity, Relation, MemoryItem, RecallResult

def test_entity_creation():
    e = Entity(name="PostgreSQL", entity_type="TechStack", description="Relational database")
    assert e.name == "PostgreSQL"
    assert e.entity_type == "TechStack"
    assert e.description == "Relational database"

def test_relation_creation():
    r = Relation(source="Backend", relation="CONNECTS_TO", target="PostgreSQL", context="Via asyncpg")
    assert r.source == "Backend"
    assert r.relation == "CONNECTS_TO"
    assert r.target == "PostgreSQL"
    assert r.context == "Via asyncpg"

def test_memory_item():
    m = MemoryItem(content="Always use dark mode for the dashboard.")
    assert m.content == "Always use dark mode for the dashboard."
    assert m.id is not None
    assert len(m.id) > 10
