# 🔌 Connecting Cortex Memory to Claude (Desktop & CLI)

Learn how to connect **Cortex** to **Claude Desktop** and **Claude Code CLI** to give Claude long-term memory across sessions.

---

## Part 1: Claude Desktop

### Option A: The 1-Click CLI Installer (Fastest)

```bash
uv run cortex install-mcp claude
```

Restart Claude Desktop, and Cortex will appear with a hammer icon (tools).

### Option B: Manual Setup

Locate your Claude Desktop config file:
* **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
* **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
* **Linux:** `~/.config/Claude/claude_desktop_config.json`

Add the `cortex-mem` server:

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

## Part 2: Claude Code CLI (`claude`)

Anthropic's new **Claude Code** agentic CLI connects natively to MCP servers!

### Add via the Claude CLI command:

```bash
claude mcp add cortex-mem uv -- --directory /absolute/path/to/memory_for_agents run cortex mcp
```

### Verify Connection:

```bash
claude mcp list
```

You will see:
```
cortex-mem: uv --directory ... (remember, recall, forget, memory_stats)
```

---

## 💬 Usage Examples with Claude

* *"Remember that our frontend uses Tailwind v4 and Next.js 15 App Router."*
* *"What is our frontend stack?"* (Claude automatically queries `recall` tool)
* *"Delete the memory about our legacy backend."*
