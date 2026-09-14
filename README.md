# 🧠 ContextSync (`contextsync.dev`)

> **Persistent Long-Term Memory Engine for AI Agents & Coding Assistants**  
> Combines high-speed vector embeddings (**LanceDB**) with an interconnected Knowledge Graph (**SQLite / Kùzu**) to give your AI tools permanent recall across sessions.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Python 3.13+](https://img.shields.io/badge/python-3.13+-blue.svg)](https://www.python.org/)
[![MCP Ready](https://img.shields.io/badge/MCP-Protocol_2.x-green.svg)](https://modelcontextprotocol.io/)

---

## ⚡ 1-Click MCP Connectors

Install ContextSync into your favorite editor in one second:

```bash
# Connect to Cursor
uv run contextsync install-mcp cursor

# Connect to Claude Desktop
uv run contextsync install-mcp claude

# Connect to Windsurf (Codeium)
uv run contextsync install-mcp windsurf

# Or connect to all at once!
uv run contextsync install-mcp all
```

Restart your editor, and your AI assistant immediately gains persistent memory.

---

## 📚 Complete Connector Guides

* 🔌 **[Cursor Setup Guide](docs/connectors/cursor.md)** *(Recommended for Cursor users)*
* 🔌 **[Claude Desktop & Claude Code CLI Guide](docs/connectors/claude.md)**
* 🔌 **[Windsurf (Codeium) Guide](docs/connectors/windsurf.md)**
* 🔌 **[Generic MCP, LangChain & CrewAI Guide](docs/connectors/generic_mcp.md)**

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│            Cursor / Claude Code / AI Agents            │
└───────────────────────────┬────────────────────────────┘
                            │ Model Context Protocol (MCP)
                            ▼
┌────────────────────────────────────────────────────────┐
│                 ContextSync Memory Core                │
│  - Extraction: Google Gemini 2.0 Flash (JSON Schemas)  │
│  - Embedding: text-embedding-004                       │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
   ┌──────────────────────┐    ┌──────────────────────┐
   │  LanceDB (Vectors)   │    │ SQLite (Graph Store) │
   │  Fast Nearest Search │    │ Entities & Relations │
   └──────────────────────┘    └──────────────────────┘
```

---

## 🚀 Quickstart (30 Seconds)

### 1. Install & Run locally
Clone this repository and use `uv`:

```bash
cd memory_for_agents
uv sync
```

### 2. Configure your Gemini API Key (Optional)
ContextSync uses Google Gemini 2.0 Flash for instant, ultra-cheap entity extraction. Get a free key at [Google AI Studio](https://aistudio.google.com/).

```bash
cp .env.example .env
# Add your GEMINI_API_KEY inside .env
```

*(Note: If no API key is provided, ContextSync operates in offline heuristic mode).*

### 3. Store & Recall from the CLI

```bash
# Remember a project architecture rule
uv run contextsync remember "Project Apollo uses PostgreSQL and is maintained by Alice" --tag architecture

# Query memory
uv run contextsync recall "Who maintains Apollo?"

# Check memory statistics
uv run contextsync stats
```

---

## 💎 The SaaS Business Model ($9/mo on contextsync.dev)

* **Open-Source Core:** Free forever on GitHub. Runs locally on developer laptops with their own API keys.
* **ContextSync Cloud ($9/mo or $89/year):**
  * Multi-device synchronization (Work Mac + Home Desktop + Laptop).
  * Web dashboard with interactive Knowledge Graph mindmap.
  * Zero-setup managed cloud endpoints.
  * ~90% gross profit margin per subscriber.

---

## 🧪 Running Tests

```bash
uv run pytest -v
```
