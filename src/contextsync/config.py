from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Default directory for cortex memory data
DEFAULT_DATA_DIR = Path.home() / ".contextsync"
CORTEX_DATA_DIR = Path(os.getenv("CORTEX_DATA_DIR", str(DEFAULT_DATA_DIR)))
CORTEX_DATA_DIR.mkdir(parents=True, exist_ok=True)

# Database Paths
VECTOR_DB_DIR = CORTEX_DATA_DIR / "lancedb"
GRAPH_DB_PATH = CORTEX_DATA_DIR / "cortex_graph.db"

# API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Default Models
DEFAULT_LLM_MODEL = os.getenv("CORTEX_LLM_MODEL", "gemini-2.0-flash")
DEFAULT_EMBED_MODEL = os.getenv("CORTEX_EMBED_MODEL", "text-embedding-004")
