# 🔌 Connecting Cortex Memory to Windsurf (Codeium)

Windsurf by Codeium is an AI-powered IDE with built-in MCP support. Connect **Cortex** to allow the Cascade agent to maintain project memory.

---

## ⚡ Method 1: The 1-Click CLI Installer (Fastest)

```bash
uv run cortex install-mcp windsurf
```

Restart Windsurf, and Cascade will be armed with Cortex memory tools.

---

## 🛠️ Method 2: Manual Configuration

Windsurf stores its MCP configuration at:
* `~/.codeium/windsurf/mcp_config.json`

Open this file and add:

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

## 🎯 Usage in Windsurf Cascade

Ask Cascade:
* *"Remember our database schema: users table has id, email, and created_at."*
* *"Recall what columns are in the users table."*
