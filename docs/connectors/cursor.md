# 🔌 Connecting Cortex Memory to Cursor

Cursor is the leading AI-powered code editor. By connecting **Cortex**, your Cursor agent gains a persistent knowledge graph that remembers your architectural choices, coding conventions, and project history across restarts and new sessions.

---

## ⚡ Method 1: The 1-Click CLI Installer (Fastest)

Run this in your terminal:

```bash
uv run cortex install-mcp cursor
```

That's it! Cortex automatically locates your Cursor configuration file and injects the server definition. Restart Cursor to start using it.

---

## 🛠️ Method 2: Manual Configuration

If you prefer to configure it manually:

1. Open Cursor.
2. Go to **Settings** (`Cmd + ,` on Mac or `Ctrl + ,` on Windows).
3. Navigate to **Features > MCP Servers**.
4. Click **+ Add New MCP Server**:
   * **Name:** `cortex-mem`
   * **Type:** `command`
   * **Command:** `uv --directory /absolute/path/to/memory_for_agents run cortex mcp`

Alternatively, directly edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "cortex-mem": {
      "command": "uv",
      "args": [
        "--directory",
        "/absolute/path/to/memory_for_agents",
        "run",
        "cortex",
        "mcp"
      ]
    }
  }
}
```

---

## 🚀 How to Use Cortex Inside Cursor

Once connected, Cursor will automatically have 4 new MCP tools:
* `remember(content, tags)`
* `recall(query, limit)`
* `forget(memory_id)`
* `memory_stats()`

### Example Prompts in Cursor Composer (`Cmd + I`) or Chat (`Cmd + L`):

1. **Teaching Cursor your codebase rules:**
   > *"Remember: We use snake_case for Python variables, and all database queries must use asyncpg."*
   * *Cursor will call `remember` tool and save it into your Knowledge Graph.*

2. **Recalling context automatically:**
   > *"How do we structure database queries in this project?"*
   * *Cursor will call `recall` tool, retrieve the exact rule, and write compliant code.*

3. **Verifying stored memories:**
   > *"Show me our memory stats."*
   * *Cursor will return your total memories and knowledge graph entity count.*
