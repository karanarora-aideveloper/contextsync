from typing import List, Optional, Dict, Any
from pathlib import Path
import json
import lancedb
import pyarrow as pa
from contextsync.models import MemoryItem

class VectorStore:
    """LanceDB embedded vector database for fast similarity search."""

    def __init__(self, db_path: Path, dimension: int = 768):
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.dimension = dimension
        self.db = lancedb.connect(str(self.db_path))
        self.table_name = "memories"
        self._table = None
        self._init_table()

    def _init_table(self):
        """Ensure the memories table exists with the proper schema."""
        schema = pa.schema([
            pa.field("id", pa.string()),
            pa.field("vector", pa.list_(pa.float32(), self.dimension)),
            pa.field("content", pa.string()),
            pa.field("summary", pa.string()),
            pa.field("created_at", pa.string()),
            pa.field("tags", pa.string()),
            pa.field("source", pa.string())
        ])

        # Modern table check (handles both list_tables and table_names)
        existing_tables = []
        try:
            res = self.db.list_tables()
            existing_tables = res.tables if hasattr(res, "tables") else list(res)
        except Exception:
            existing_tables = self.db.table_names()

        if self.table_name in existing_tables:
            self._table = self.db.open_table(self.table_name)
        else:
            self._table = self.db.create_table(self.table_name, schema=schema)

    def add_memory(self, item: MemoryItem, vector: List[float]):
        """Add a memory item with its vector embedding."""
        record = [{
            "id": item.id,
            "vector": vector,
            "content": item.content,
            "summary": item.summary or "",
            "created_at": item.created_at,
            "tags": json.dumps(item.tags),
            "source": item.source or "user"
        }]
        self._table.add(record)

    def search(self, query_vector: List[float], limit: int = 5) -> List[MemoryItem]:
        """Search top-K nearest memories by vector distance."""
        if len(self._table) == 0:
            return []

        try:
            results = self._table.search(query_vector).limit(limit).to_list()
            matched = []
            for r in results:
                tags = []
                try:
                    tags = json.loads(r.get("tags", "[]"))
                except Exception:
                    pass

                distance = r.get("_distance", 0.0)
                score = round(1.0 / (1.0 + float(distance)), 4)

                matched.append(MemoryItem(
                    id=r["id"],
                    content=r["content"],
                    summary=r.get("summary") or None,
                    created_at=r["created_at"],
                    tags=tags,
                    source=r.get("source", "user"),
                    score=score
                ))
            return matched
        except Exception:
            return []

    def delete(self, memory_id: str) -> bool:
        """Delete a memory from LanceDB by ID."""
        try:
            # SQL string literal uses single quotes
            self._table.delete(f"id = '{memory_id}'")
            return True
        except Exception:
            return False

    def count(self) -> int:
        """Return total count of vectors in the table."""
        return len(self._table)
