from typing import List, Optional, Tuple, Dict, Any
import sqlite3
import json
from pathlib import Path
from contextsync.models import Entity, Relation, MemoryItem

class GraphStore:
    """SQLite-backed Knowledge Graph store for entities, relations, and metadata."""

    def __init__(self, db_path: Path):
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        """Create tables and indexes if they don't exist."""
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS memories (
                    id TEXT PRIMARY KEY,
                    content TEXT NOT NULL,
                    summary TEXT,
                    source TEXT,
                    tags_json TEXT,
                    created_at TEXT
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS entities (
                    name TEXT PRIMARY KEY,
                    entity_type TEXT NOT NULL,
                    description TEXT,
                    metadata_json TEXT,
                    updated_at TEXT
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS relations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    source TEXT NOT NULL,
                    relation TEXT NOT NULL,
                    target TEXT NOT NULL,
                    context TEXT,
                    memory_id TEXT,
                    created_at TEXT,
                    FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE CASCADE
                )
            """)

            # Indexes for fast relationship traversal
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_relations_source ON relations(source)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_relations_target ON relations(target)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_relations_memory ON relations(memory_id)")
            conn.commit()

    def save_memory(self, item: MemoryItem):
        """Save raw memory record."""
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO memories (id, content, summary, source, tags_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                item.id,
                item.content,
                item.summary,
                item.source,
                json.dumps(item.tags),
                item.created_at
            ))
            conn.commit()

    def upsert_entities(self, entities: List[Entity]):
        """Upsert a list of entities into the graph."""
        if not entities:
            return
        with self._get_conn() as conn:
            cursor = conn.cursor()
            for entity in entities:
                cursor.execute("""
                    INSERT INTO entities (name, entity_type, description, metadata_json, updated_at)
                    VALUES (?, ?, ?, ?, datetime('now'))
                    ON CONFLICT(name) DO UPDATE SET
                        entity_type = excluded.entity_type,
                        description = COALESCE(excluded.description, entities.description),
                        metadata_json = excluded.metadata_json,
                        updated_at = datetime('now')
                """, (
                    entity.name,
                    entity.entity_type,
                    entity.description,
                    json.dumps(entity.metadata)
                ))
            conn.commit()

    def add_relations(self, relations: List[Relation], memory_id: Optional[str] = None):
        """Insert relationships into the graph."""
        if not relations:
            return
        with self._get_conn() as conn:
            cursor = conn.cursor()
            for rel in relations:
                cursor.execute("""
                    INSERT INTO relations (source, relation, target, context, memory_id, created_at)
                    VALUES (?, ?, ?, ?, ?, datetime('now'))
                """, (
                    rel.source,
                    rel.relation,
                    rel.target,
                    rel.context,
                    memory_id
                ))
            conn.commit()

    def find_connected_subgraph(self, entity_names: List[str], depth: int = 1) -> Tuple[List[Entity], List[Relation]]:
        """Traverse graph starting from matched entity names."""
        if not entity_names:
            return [], []

        matched_entities: Dict[str, Entity] = {}
        matched_relations: List[Relation] = []
        visited = set(entity_names)

        with self._get_conn() as conn:
            cursor = conn.cursor()

            # 1. Fetch source entities
            placeholders = ",".join(["?"] * len(entity_names))
            cursor.execute(f"SELECT * FROM entities WHERE name IN ({placeholders})", entity_names)
            for row in cursor.fetchall():
                matched_entities[row["name"]] = Entity(
                    name=row["name"],
                    entity_type=row["entity_type"],
                    description=row["description"],
                    metadata=json.loads(row["metadata_json"] or "{}")
                )

            # 2. Traverse connections
            cursor.execute(f"""
                SELECT source, relation, target, context 
                FROM relations 
                WHERE source IN ({placeholders}) OR target IN ({placeholders})
            """, entity_names + entity_names)

            related_names = set()
            for row in cursor.fetchall():
                rel = Relation(
                    source=row["source"],
                    relation=row["relation"],
                    target=row["target"],
                    context=row["context"]
                )
                matched_relations.append(rel)
                related_names.add(row["source"])
                related_names.add(row["target"])

            # 3. Fetch connected target entities if not already fetched
            new_names = [n for n in related_names if n not in matched_entities]
            if new_names:
                p2 = ",".join(["?"] * len(new_names))
                cursor.execute(f"SELECT * FROM entities WHERE name IN ({p2})", new_names)
                for row in cursor.fetchall():
                    matched_entities[row["name"]] = Entity(
                        name=row["name"],
                        entity_type=row["entity_type"],
                        description=row["description"],
                        metadata=json.loads(row["metadata_json"] or "{}")
                    )

        return list(matched_entities.values()), matched_relations

    def search_entities_by_text(self, text: str) -> List[Entity]:
        """Find entities mentioned in the query text."""
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM entities")
            entities = []
            lower_text = text.lower()
            for row in cursor.fetchall():
                if row["name"].lower() in lower_text:
                    entities.append(Entity(
                        name=row["name"],
                        entity_type=row["entity_type"],
                        description=row["description"],
                        metadata=json.loads(row["metadata_json"] or "{}")
                    ))
            return entities

    def delete_memory(self, memory_id: str) -> bool:
        """Delete a memory and its associated relations."""
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM relations WHERE memory_id = ?", (memory_id,))
            cursor.execute("DELETE FROM memories WHERE id = ?", (memory_id,))
            conn.commit()
            return cursor.rowcount > 0

    def get_stats(self) -> Dict[str, int]:
        """Return counts of memories, entities, and relations."""
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM memories")
            mem_count = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM entities")
            ent_count = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM relations")
            rel_count = cursor.fetchone()[0]
            return {
                "memories": mem_count,
                "entities": ent_count,
                "relations": rel_count
            }
