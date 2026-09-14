# 🔌 Generic MCP & Agent Framework Integration

Cortex is built on the standard **Model Context Protocol (MCP 2.x)**, making it compatible with any autonomous AI framework or agent runtime.

---

## 1. Connecting via LangChain / LangGraph

```python
import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from langchain_mcp_adapters.tools import load_mcp_tools

async def main():
    server_params = StdioServerParameters(
        command="uv",
        args=["--directory", "/path/to/memory_for_agents", "run", "cortex", "mcp"]
    )
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await load_mcp_tools(session)
            print("Loaded MCP Tools into LangChain:", [t.name for t in tools])

asyncio.run(main())
```

---

## 2. Connecting with CrewAI

In CrewAI, wrap Cortex MCP tools into custom tools:

```python
from crewai.tools import tool
from cortex_mem.memory import MemoryEngine

engine = MemoryEngine()

@tool("Recall Memory")
def recall_memory(query: str) -> str:
    """Useful to search past knowledge, conventions, and facts."""
    import asyncio
    res = asyncio.run(engine.recall(query=query))
    return res.formatted_context
```

---

## 3. Direct Python Library Integration (No MCP required)

If you are writing a custom backend or script, import the Python SDK directly:

```python
import asyncio
from cortex_mem.memory import MemoryEngine

async def run():
    engine = MemoryEngine()
    
    # Store
    await engine.remember("Stripe payments use webhook secret whsec_123 in production.")
    
    # Query
    result = await engine.recall("What is our Stripe webhook secret?")
    print(result.formatted_context)

asyncio.run(run())
```
