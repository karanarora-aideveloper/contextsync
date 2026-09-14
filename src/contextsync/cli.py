import asyncio
from typing import Optional, List
import typer
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from contextsync.memory import MemoryEngine
from contextsync.config import CORTEX_DATA_DIR, GEMINI_API_KEY
from contextsync.installer import install_mcp_config
from contextsync import __version__

app = typer.Typer(
    name="contextsync",
    help="🧠 ContextSync (contextsync.dev): Persistent Memory Engine for AI Agents & Editors."
)
console = Console()

@app.command()
def version():
    """Print the ContextSync version."""
    console.print(f"[bold cyan]ContextSync[/bold cyan] ([dim]contextsync.dev[/dim]) version [green]{__version__}[/green]")

@app.command()
def init():
    """Initialize ContextSync storage and print configuration status."""
    engine = MemoryEngine()
    key_status = "[green]Detected[/green]" if GEMINI_API_KEY else "[yellow]Missing (using offline heuristic mode)[/yellow]"
    
    panel = Panel(
        f"[bold]Storage Directory:[/bold] {CORTEX_DATA_DIR}\n"
        f"[bold]Gemini API Key:[/bold] {key_status}\n"
        f"[bold]Vector Store:[/bold] LanceDB (Embedded)\n"
        f"[bold]Graph Store:[/bold] SQLite (Knowledge Graph)",
        title="🧠 ContextSync (contextsync.dev)",
        border_style="cyan"
    )
    console.print(panel)

@app.command()
def remember(
    content: str = typer.Argument(..., help="The text, rule, or knowledge to remember"),
    tag: Optional[List[str]] = typer.Option(None, "--tag", "-t", help="Tags to associate with this memory")
):
    """Store knowledge or rules into persistent memory."""
    engine = MemoryEngine()
    with console.status("[bold green]Syncing into Knowledge Graph and Vector store..."):
        item = asyncio.run(engine.remember(content=content, tags=tag or []))

    console.print(f"[bold green]✓ Memory remembered![/bold green] (ID: [dim]{item.id}[/dim])")
    if item.summary:
        console.print(f"[bold]Summary:[/bold] {item.summary}")

@app.command()
def recall(
    query: str = typer.Argument(..., help="Question or concept to search"),
    limit: int = typer.Option(5, "--limit", "-l", help="Number of memories to retrieve")
):
    """Search memory using hybrid vector + graph traversal."""
    engine = MemoryEngine()
    with console.status(f"[bold cyan]Recalling context for: '{query}'..."):
        result = asyncio.run(engine.recall(query=query, limit=limit))

    if not result.memories and not result.entities:
        console.print(f"[yellow]No memories found for: '{query}'[/yellow]")
        return

    console.print(Panel(result.formatted_context, title=f"🔍 ContextSync: {query}", border_style="green"))

@app.command()
def stats():
    """Display memory statistics."""
    engine = MemoryEngine()
    s = engine.stats()
    
    table = Table(title="🧠 ContextSync Memory Stats", border_style="cyan")
    table.add_column("Metric", style="bold")
    table.add_column("Count", justify="right", style="green")

    table.add_row("Total Memories", str(s["total_memories"]))
    table.add_row("Extracted Entities", str(s["entities"]))
    table.add_row("Knowledge Graph Relations", str(s["relations"]))

    console.print(table)

@app.command("install-mcp")
def install_mcp(
    client: str = typer.Argument(
        "cursor",
        help="Target editor or client to connect: 'cursor', 'claude', 'windsurf', or 'all'"
    )
):
    """1-Click MCP Connector installer for Cursor, Claude Desktop, and Windsurf."""
    targets = ["cursor", "claude", "windsurf"] if client.lower() == "all" else [client.lower()]

    for target in targets:
        try:
            ok, msg, path = install_mcp_config(target)
            console.print(f"[bold green]✓[/bold green] ContextSync connected to [bold cyan]{target.capitalize()}[/bold cyan]!")
            console.print(f"  [dim]Config written to: {path}[/dim]")
        except Exception as e:
            console.print(f"[bold red]✗[/bold red] Failed to connect to {target}: {e}")

    console.print("\n[bold]Done![/bold] Restart your editor, and ContextSync will be connected automatically.")

@app.command()
def mcp():
    """Start the MCP server over standard I/O (for Cursor, Claude Code, Windsurf)."""
    from contextsync.mcp_server import run_stdio
    run_stdio()

if __name__ == "__main__":
    app()
