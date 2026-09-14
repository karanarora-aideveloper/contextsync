import pytest
from contextsync.mcp_server import server

@pytest.mark.asyncio
async def test_mcp_server_tools_registration():
    tools = await server.list_tools()
    tool_names = [t.name for t in tools]
    assert "remember" in tool_names
    assert "recall" in tool_names
    assert "forget" in tool_names
    assert "memory_stats" in tool_names

@pytest.mark.asyncio
async def test_mcp_remember_and_recall():
    from contextsync.mcp_server import remember, recall, memory_stats

    # Call remember tool
    rem_resp = await remember(
        content="Antigravity uses Python 3.13 and Google Gemini 2.0 Flash.",
        tags=["config", "test"]
    )
    assert "Memory stored successfully" in rem_resp

    # Call recall tool
    recall_resp = await recall(query="What Python version does Antigravity use?")
    assert "Antigravity" in recall_resp or "Python" in recall_resp

    # Check stats
    stats_resp = await memory_stats()
    assert "Memories:" in stats_resp
