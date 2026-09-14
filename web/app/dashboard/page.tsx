"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Brain, 
  Database, 
  Search, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Share2, 
  Sparkles, 
  ArrowLeft, 
  Clock, 
  Tag, 
  Key, 
  Copy, 
  Check, 
  LogOut, 
  ShieldCheck, 
  Plug, 
  Terminal,
  Code2,
  Info
} from "lucide-react";
import { useTheme } from "../../components/ThemeContext";
import ThemeToggle from "../../components/ThemeToggle";


interface Memory {
  id: string;
  content: string;
  summary?: string;
  tags: string[];
  created_at: string;
}

interface GraphNode {
  id: string;
  type: string;
  description?: string;
}

interface GraphLink {
  source: string;
  relation: string;
  target: string;
  context?: string;
}

interface UserProfile {
  id: string;
  email: string;
  plan: string;
  api_key: string;
}

const API_BASE = "http://127.0.0.1:8000";

function MetricTooltip({ title, description }: { title: string; description: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div 
      className="relative inline-flex items-center ml-1.5"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="h-4 w-4 rounded-full inline-flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
        aria-label={`Information about ${title}`}
      >
        <Info className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-2xl border border-slate-700 z-50 pointer-events-none">
          <div className="font-bold text-xs text-indigo-400 mb-1 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span>{title}</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300 font-normal">
            {description}
          </p>
          <div className="w-2 h-2 bg-slate-900 border-r border-b border-slate-700 rotate-45 absolute -bottom-1 left-2" />
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<"graph" | "memories" | "recall" | "connectors">("graph");

  const [stats, setStats] = useState({ total_memories: 0, entities: 0, relations: 0 });
  const [memories, setMemories] = useState<Memory[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  
  // User Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [selectedConnector, setSelectedConnector] = useState<string>("antigravity");

  // New Memory Form
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Recall Playground
  const [query, setQuery] = useState("");
  const [recallResult, setRecallResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [loading, setLoading] = useState(true);

  // Auth Guard & Fetch
  useEffect(() => {
    const token = localStorage.getItem("ctx_token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchUserData(token);
  }, []);

  const fetchUserData = async (token: string) => {
    setLoading(true);
    const headers = { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    };

    try {
      // 1. Fetch user profile
      const meRes = await fetch(`${API_BASE}/api/auth/me`, { headers });
      if (meRes.status === 401) {
        localStorage.removeItem("ctx_token");
        router.push("/login");
        return;
      }
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
      }

      // 2. Fetch Stats
      const sRes = await fetch(`${API_BASE}/api/stats`, { headers });
      if (sRes.ok) setStats(await sRes.json());

      // 3. Fetch Memories
      const mRes = await fetch(`${API_BASE}/api/memories`, { headers });
      if (mRes.ok) {
        const mData = await mRes.json();
        setMemories(mData.memories || []);
      }

      // 4. Fetch Graph
      const gRes = await fetch(`${API_BASE}/api/graph`, { headers });
      if (gRes.ok) {
        const gData = await gRes.json();
        setGraphData(gData);
      }
    } catch (err) {
      console.error("Failed to connect to API:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ctx_token");
    localStorage.removeItem("ctx_user");
    router.push("/login");
  };

  const handleCopyKey = () => {
    if (user?.api_key) {
      navigator.clipboard.writeText(user.api_key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    const token = localStorage.getItem("ctx_token");
    if (!token) return;

    setIsAdding(true);
    try {
      const tagsArray = newTags.split(",").map(t => t.trim()).filter(Boolean);
      const res = await fetch(`${API_BASE}/api/memories`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ content: newContent, tags: tagsArray })
      });
      if (res.ok) {
        setNewContent("");
        setNewTags("");
        await fetchUserData(token);
      } else {
        const err = await res.json();
        alert(err.detail || "Failed to add memory");
      }
    } catch (err) {
      alert("Error connecting to server.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    const token = localStorage.getItem("ctx_token");
    if (!token) return;
    try {
      await fetch(`${API_BASE}/api/memories/${id}`, { 
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setMemories(memories.filter(m => m.id !== id));
      await fetchUserData(token);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const token = localStorage.getItem("ctx_token");
    if (!token) return;

    setIsSearching(true);
    try {
      const res = await fetch(`${API_BASE}/api/recall`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ query, limit: 5 })
      });
      if (res.ok) {
        setRecallResult(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const userKey = user?.api_key || "ctx_live_your_api_key_here";

  // List of all connectors
  const connectors = [
    {
      id: "antigravity",
      name: "Google Antigravity",
      category: "IDE / Autonomous Agent",
      badge: "Official MCP",
      description: "Google's next-gen agentic coding IDE. Connects via standard MCP server.",
      command: `uvx --from git+https://github.com/karanarora-aideveloper/contextsync contextsync install-mcp antigravity`,
      jsonConfig: `{
  "mcpServers": {
    "contextsync": {
      "command": "uvx",
      "args": ["--from", "git+https://github.com/karanarora-aideveloper/contextsync", "contextsync", "mcp"],
      "env": {
        "CONTEXTSYNC_API_KEY": "${userKey}"
      }
    }
  }
}`
    },
    {
      id: "cursor",
      name: "Cursor",
      category: "AI Code Editor",
      badge: "1-Click Ready",
      description: "The leading AI editor. Inject rules into Cursor Composer & Chat.",
      command: `uvx --from git+https://github.com/karanarora-aideveloper/contextsync contextsync install-mcp cursor`,
      jsonConfig: `{
  "mcpServers": {
    "contextsync": {
      "command": "uvx",
      "args": ["--from", "git+https://github.com/karanarora-aideveloper/contextsync", "contextsync", "mcp"]
    }
  }
}`
    },
    {
      id: "claudecode",
      name: "Claude Code CLI",
      category: "Agentic Terminal",
      badge: "Anthropic CLI",
      description: "Anthropic's high-speed agentic terminal assistant.",
      command: `claude mcp add contextsync uvx -- --from git+https://github.com/karanarora-aideveloper/contextsync contextsync mcp`,
      jsonConfig: `// Run in terminal:\nclaude mcp add contextsync uvx -- --from git+https://github.com/karanarora-aideveloper/contextsync contextsync mcp`
    },
    {
      id: "claudedesktop",
      name: "Claude Desktop",
      category: "Desktop Application",
      badge: "Anthropic MCP",
      description: "Claude's official Mac/Windows desktop client.",
      command: `uvx --from git+https://github.com/karanarora-aideveloper/contextsync contextsync install-mcp claude`,
      jsonConfig: `{
  "mcpServers": {
    "contextsync": {
      "command": "uvx",
      "args": ["--from", "git+https://github.com/karanarora-aideveloper/contextsync", "contextsync", "mcp"]
    }
  }
}`
    },
    {
      id: "windsurf",
      name: "Windsurf (Codeium)",
      category: "AI IDE",
      badge: "Cascade Ready",
      description: "Codeium's agentic IDE powered by the Cascade engine.",
      command: `uvx --from git+https://github.com/karanarora-aideveloper/contextsync contextsync install-mcp windsurf`,
      jsonConfig: `{
  "mcpServers": {
    "contextsync": {
      "command": "uvx",
      "args": ["--from", "git+https://github.com/karanarora-aideveloper/contextsync", "contextsync", "mcp"]
    }
  }
}`
    },
    {
      id: "cline",
      name: "Cline / Roo Code",
      category: "VS Code Extension",
      badge: "Autonomous Agent",
      description: "Autonomous coding agent extension inside Visual Studio Code.",
      command: `// Add to cline_mcp_settings.json`,
      jsonConfig: `{
  "mcpServers": {
    "contextsync": {
      "command": "uvx",
      "args": ["--from", "git+https://github.com/karanarora-aideveloper/contextsync", "contextsync", "mcp"]
    }
  }
}`
    },
    {
      id: "continue",
      name: "Continue.dev",
      category: "VS Code & JetBrains",
      badge: "Multi-IDE",
      description: "Open-source AI coding extension for VS Code and JetBrains IDEs.",
      command: `// Add to ~/.continue/config.json`,
      jsonConfig: `{
  "contextProviders": [
    {
      "name": "mcp",
      "params": {
        "command": "uvx",
        "args": ["--from", "git+https://github.com/karanarora-aideveloper/contextsync", "contextsync", "mcp"]
      }
    }
  ]
}`
    },
    {
      id: "python_rest",
      name: "Python SDK & REST API",
      category: "Custom Agents / Frameworks",
      badge: "LangChain / CrewAI",
      description: "Connect LangChain, CrewAI, or any custom Python application directly.",
      command: `pip install git+https://github.com/karanarora-aideveloper/contextsync.git`,
      jsonConfig: `import asyncio
from contextsync.memory import MemoryEngine

engine = MemoryEngine()
# Store
asyncio.run(engine.remember("Always use asyncpg for PostgreSQL queries."))
# Recall
res = asyncio.run(engine.recall("What database driver do we use?"))
print(res.formatted_context)`
    }
  ];

  const currentConnectorData = connectors.find(c => c.id === selectedConnector) || connectors[0];

  return (
    <div className={`min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200 ${
      theme === "light" ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-100"
    }`}>
      {/* Header */}
      <header className={`border-b px-6 py-4 sticky top-0 z-40 backdrop-blur-md transition-colors duration-200 ${
        theme === "light" ? "bg-white/80 border-slate-200" : "bg-slate-900/50 border-slate-800/80"
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className={`flex items-center gap-2 transition-colors mr-2 ${
              theme === "light" ? "text-slate-500 hover:text-slate-900" : "text-slate-400 hover:text-white"
            }`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-bold tracking-tight">ContextSync Hub</span>
              {user && (
                <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  {user.email}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Plan Badge */}
            <span className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5 font-medium ${
              theme === "light" ? "bg-slate-100 border-slate-200 text-slate-700" : "bg-slate-800 border-slate-700 text-slate-300"
            }`}>
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>{user?.plan === 'pro' ? 'Pro Plan ($9/mo)' : 'Free Tier (50 Max)'}</span>
            </span>

            {/* Quick Key Copy */}
            <button
              onClick={handleCopyKey}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 text-indigo-500 text-xs font-medium transition-colors"
              title="Copy Secret API Key"
            >
              <Key className="h-3.5 w-3.5" />
              <span>{copiedKey ? "Copied Key!" : "Copy API Key"}</span>
            </button>

            {/* Theme Toggle (Light / Dark) */}
            <ThemeToggle />

            {/* Refresh */}
            <button
              onClick={() => {
                const t = localStorage.getItem("ctx_token");
                if (t) fetchUserData(t);
              }}
              className={`p-2 rounded-lg transition-colors ${
                theme === "light" ? "bg-slate-100 hover:bg-slate-200 text-slate-600" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
              }`}
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`p-2 rounded-lg transition-colors ${
                theme === "light" ? "bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500" : "bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400"
              }`}
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center">
                <span className="text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Saved Rules</span>
                <MetricTooltip
                  title="Saved Rules & Memories"
                  description="Things your AI must always remember — like your preferred tech stack, styling conventions, and project rules."
                />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.total_memories}</div>
              <span className="text-xs text-slate-500">Project rules & decisions</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Database className="h-6 w-6" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center">
                <span className="text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Topics & Tools</span>
                <MetricTooltip
                  title="Topics & Tools Learned"
                  description="Specific technologies, libraries, and components your AI recognized across your project (e.g. Next.js, Tailwind, Supabase)."
                />
              </div>
              <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">{stats.entities}</div>
              <span className="text-xs text-slate-500">Tech stack & components</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Brain className="h-6 w-6" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center">
                <span className="text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Connected Dots</span>
                <MetricTooltip
                  title="Connected Dots (Relationships)"
                  description="How things connect in your project (e.g. 'Frontend uses Tailwind', 'API connects to Database'). Helps your AI see the big picture."
                />
              </div>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.relations}</div>
              <span className="text-xs text-slate-500">Smart links between topics</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Share2 className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab("connectors")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "connectors"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Plug className="h-4 w-4" />
            <span>Connect AI</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 font-mono">1-Click</span>
          </button>
          <button
            onClick={() => setActiveTab("graph")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "graph"
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Share2 className="h-4 w-4" />
            <span>Brain Map</span>
          </button>
          <button
            onClick={() => setActiveTab("memories")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "memories"
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Database className="h-4 w-4" />
            <span>Saved Rules ({memories.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("recall")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "recall"
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Search className="h-4 w-4" />
            <span>Ask AI</span>
          </button>
        </div>

        {/* TAB: UNIVERSAL CONNECTORS HUB */}
        {activeTab === "connectors" && (
          <div className="space-y-8">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-slate-50 dark:from-emerald-950/40 dark:via-slate-900/60 dark:to-slate-900/60 border border-emerald-200 dark:border-emerald-500/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plug className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Universal Connectors Hub</span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Connect your personal ContextSync vault to any AI assistant in under 30 seconds.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Your API Key:</span>
                <code className="text-xs font-mono text-emerald-600 dark:text-emerald-400">{userKey.substring(0, 14)}...</code>
                <button
                  onClick={handleCopyKey}
                  className="p-1 rounded bg-white hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 ml-1 transition-colors border border-slate-200 dark:border-transparent"
                  title="Copy Full API Key"
                >
                  {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Connector List */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block px-1">
                  Select Your Assistant:
                </span>
                {connectors.map((c) => {
                  const isSelected = selectedConnector === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedConnector(c.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-emerald-50/70 dark:bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                          : "bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/70 shadow-sm"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span>{c.name}</span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">{c.category}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {c.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Connector Configuration Pane */}
              <div className="md:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="space-y-1.5 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{currentConnectorData.name}</span>
                    </h3>
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 font-semibold">
                      {currentConnectorData.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{currentConnectorData.description}</p>
                </div>

                {/* 1-Click Command Snippet */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Terminal className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Option A: 1-Click Terminal Command</span>
                    </span>
                    <button
                      onClick={() => copyCode(currentConnectorData.command, "cmd")}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1 font-medium"
                    >
                      {copiedSnippet === "cmd" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedSnippet === "cmd" ? "Copied!" : "Copy Command"}</span>
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto select-all shadow-inner">
                    {currentConnectorData.command}
                  </pre>
                </div>

                {/* Manual JSON / Config Snippet */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Code2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Option B: Configuration Snippet</span>
                    </span>
                    <button
                      onClick={() => copyCode(currentConnectorData.jsonConfig, "json")}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 font-medium"
                    >
                      {copiedSnippet === "json" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedSnippet === "json" ? "Copied!" : "Copy Snippet"}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed select-all shadow-inner">
                    {currentConnectorData.jsonConfig}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Brain Map Canvas */}
        {activeTab === "graph" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg text-slate-900 dark:text-white">Visual Brain Map</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Click on any topic to see what it links to in your project.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-500">{graphData.nodes.length} topics · {graphData.links.length} links</span>
              </div>

              <div className="min-h-[350px] rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 p-6 flex flex-wrap items-center justify-center gap-6 relative overflow-hidden">
                {graphData.nodes.length === 0 ? (
                  <div className="text-center text-slate-500 text-sm">No topics learned yet. Teach your AI a rule to build its map.</div>
                ) : (
                  graphData.nodes.map((node, idx) => {
                    const isSelected = selectedNode?.id === node.id;
                    return (
                      <button
                        key={`${node.id}-${idx}`}
                        onClick={() => setSelectedNode(node)}
                        className={`p-4 rounded-2xl transition-all text-left flex flex-col gap-1.5 shadow-md ${
                          isSelected
                            ? "bg-indigo-600 text-white scale-105 ring-4 ring-indigo-500/30"
                            : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                          <span className="font-bold text-sm">{node.id}</span>
                        </div>
                        <span className="text-xs opacity-75 font-mono">{node.type}</span>
                        {node.description && (
                          <span className="text-[11px] opacity-60 line-clamp-1">{node.description}</span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {selectedNode && (
                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-indigo-900 dark:text-indigo-300">
                      Connections for: <strong className="text-indigo-700 dark:text-white">{selectedNode.id}</strong>
                    </span>
                    <button onClick={() => setSelectedNode(null)} className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
                      Close
                    </button>
                  </div>
                  <div className="space-y-2">
                    {graphData.links
                      .filter(l => l.source === selectedNode.id || l.target === selectedNode.id)
                      .map((link, idx) => (
                        <div key={idx} className="text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{link.source}</span>
                          <span className="text-slate-400 dark:text-slate-500">── {link.relation.replace(/_/g, " ").toLowerCase()} ──&gt;</span>
                          <span className="font-bold text-purple-600 dark:text-purple-400">{link.target}</span>
                          {link.context && <span className="text-slate-500">({link.context})</span>}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Saved Rules List */}
        {activeTab === "memories" && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 h-fit">
              <h2 className="font-semibold text-base flex items-center gap-2 text-slate-900 dark:text-white">
                <Plus className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Teach My AI a Rule</span>
              </h2>
              <form onSubmit={handleAddMemory} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-medium">What should your AI always remember?</label>
                  <textarea
                    rows={4}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="e.g. Always use Tailwind CSS for styling and TypeScript for components."
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-medium">Tags (optional)</label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="e.g. frontend, styling, rules"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all disabled:opacity-50 shadow-sm"
                >
                  {isAdding ? "Teaching AI..." : "Save Rule"}
                </button>
              </form>
            </div>

            <div className="md:col-span-2 space-y-4">
              <h2 className="font-semibold text-base text-slate-800 dark:text-slate-300">Saved Rules & Decisions ({memories.length})</h2>
              <div className="space-y-3">
                {memories.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    No rules saved yet. Teach your AI its first rule on the left!
                  </div>
                ) : (
                  memories.map((m) => (
                    <div
                      key={m.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                    >
                      <div className="space-y-2">
                        <p className="text-sm text-slate-900 dark:text-slate-200 font-medium">{m.content}</p>
                        {m.summary && (
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">Key Takeaway: {m.summary}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {m.tags && m.tags.map((t, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-transparent">
                              <Tag className="h-3 w-3" />
                              {t}
                            </span>
                          ))}
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(m.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMemory(m.id)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        title="Delete Rule"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Ask AI */}
        {activeTab === "recall" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="font-semibold text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span>Ask Your AI Memory</span>
              </h2>
              <form onSubmit={handleRecall} className="flex gap-3">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask anything (e.g. What tech stack are we using? What are our styling rules?)"
                  className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  <Search className="h-4 w-4" />
                  <span>{isSearching ? "Searching..." : "Ask AI"}</span>
                </button>
              </form>
            </div>

            {recallResult && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-indigo-200 dark:border-indigo-500/40 shadow-sm space-y-3">
                <span className="text-xs uppercase font-bold text-indigo-600 dark:text-indigo-400">Context Automatically Sent to Cursor / Claude:</span>
                <pre className="text-xs font-mono bg-slate-950 p-4 rounded-xl text-emerald-400 whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner select-all">
                  {recallResult.formatted_context}
                </pre>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
