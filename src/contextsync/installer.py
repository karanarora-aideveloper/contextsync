import json
import os
import sys
import shutil
from pathlib import Path
from typing import Dict, Any, Tuple

def get_cortex_exec_config() -> Dict[str, Any]:
    """Generate the MCP server execution config for ContextSync."""
    uv_path = shutil.which("uv")
    cortex_dir = str(Path(__file__).resolve().parent.parent.parent)

    if uv_path:
        return {
            "command": uv_path,
            "args": [
                "--directory",
                cortex_dir,
                "run",
                "contextsync",
                "mcp"
            ]
        }
    else:
        python_path = sys.executable
        return {
            "command": python_path,
            "args": [
                "-m",
                "contextsync.mcp_server"
            ]
        }

def get_target_config_path(client: str) -> Path:
    """Resolve target config path based on client and OS."""
    client = client.lower().strip()
    home = Path.home()

    if client == "cursor":
        return home / ".cursor" / "mcp.json"
    elif client in ["claude", "claude-desktop"]:
        if sys.platform == "darwin":
            return home / "Library" / "Application Support" / "Claude" / "claude_desktop_config.json"
        elif sys.platform == "win32":
            return Path(os.environ.get("APPDATA", str(home))) / "Claude" / "claude_desktop_config.json"
        else:
            return home / ".config" / "Claude" / "claude_desktop_config.json"
    elif client == "windsurf":
        return home / ".codeium" / "windsurf" / "mcp_config.json"
    else:
        raise ValueError(f"Unsupported client '{client}'. Supported: cursor, claude, windsurf")

def install_mcp_config(client: str) -> Tuple[bool, str, Path]:
    """Inject contextsync MCP server definition into target client config."""
    config_path = get_target_config_path(client)
    config_path.parent.mkdir(parents=True, exist_ok=True)

    data = {"mcpServers": {}}
    if config_path.exists():
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            data = {"mcpServers": {}}

    if "mcpServers" not in data or not isinstance(data["mcpServers"], dict):
        data["mcpServers"] = {}

    mcp_config = get_cortex_exec_config()
    data["mcpServers"]["contextsync"] = mcp_config

    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    return True, f"Successfully injected contextsync into {client.capitalize()}", config_path
