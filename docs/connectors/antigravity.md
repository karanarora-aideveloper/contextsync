# 🔌 Connecting ContextSync to Google Antigravity

**Google Antigravity (AGY)** is the autonomous AI agent coding system designed for deep developer productivity. By connecting **ContextSync**, your Antigravity agents gain long-term memory across sessions and projects.

---

## ⚡ 1-Click Terminal Setup

Run this in your terminal:

```bash
uv run contextsync install-mcp antigravity
```

---

## 🛠️ Manual Configuration

Add `contextsync` to your Antigravity MCP settings:

```json
{
  "mcpServers": {
    "contextsync": {
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/karanarora-aideveloper/contextsync",
        "contextsync",
        "mcp"
      ],
      "env": {
        "CONTEXTSYNC_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

---

## 💬 What Antigravity Gains

Once connected, Antigravity agents have direct access to:
* `remember(content, tags)`: Saves durable project decisions, rules, and user preferences into your Knowledge Graph.
* `recall(query, limit)`: Traverses the Knowledge Graph and vector space to recall relevant architecture rules.
* `memory_stats()`: Check memory counts and connected graph entities.
