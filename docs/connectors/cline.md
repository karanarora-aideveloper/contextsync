# 🔌 Connecting ContextSync to Cline & Continue.dev

Visual Studio Code and JetBrains developers using autonomous coding extensions can easily connect ContextSync.

---

## 1. Cline / Roo Code (VS Code Extension)

Add to `cline_mcp_settings.json`:

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
      ]
    }
  }
}
```

---

## 2. Continue.dev (VS Code & JetBrains)

Add to `~/.continue/config.json`:

```json
{
  "contextProviders": [
    {
      "name": "mcp",
      "params": {
        "command": "uvx",
        "args": [
          "--from",
          "git+https://github.com/karanarora-aideveloper/contextsync",
          "contextsync",
          "mcp"
        ]
      }
    }
  ]
}
```
