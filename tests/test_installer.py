import json
import tempfile
from pathlib import Path
from unittest.mock import patch
from contextsync.installer import install_mcp_config

def test_install_mcp_cursor():
    with tempfile.TemporaryDirectory() as tmpdir:
        fake_cursor_config = Path(tmpdir) / ".cursor" / "mcp.json"

        with patch("contextsync.installer.get_target_config_path", return_value=fake_cursor_config):
            ok, msg, path = install_mcp_config("cursor")
            assert ok is True
            assert fake_cursor_config.exists()

            with open(fake_cursor_config, "r", encoding="utf-8") as f:
                data = json.load(f)

            assert "contextsync" in data["mcpServers"]
            assert "command" in data["mcpServers"]["contextsync"]
            assert "args" in data["mcpServers"]["contextsync"]

def test_install_mcp_antigravity():
    with tempfile.TemporaryDirectory() as tmpdir:
        fake_agy_config = Path(tmpdir) / "mcp_servers.json"

        with patch("contextsync.installer.get_target_config_path", return_value=fake_agy_config):
            ok, msg, path = install_mcp_config("antigravity")
            assert ok is True
            assert fake_agy_config.exists()

            with open(fake_agy_config, "r", encoding="utf-8") as f:
                data = json.load(f)

            assert "contextsync" in data["mcpServers"]
