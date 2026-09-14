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
  CreditCard
} from "lucide-react";

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

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"graph" | "memories" | "recall">("graph");
  const [stats, setStats] = useState({ total_memories: 0, entities: 0, relations: 0 });
  const [memories, setMemories] = useState<Memory[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  
  // User Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-bold tracking-tight">ContextSync Console</span>
              {user && (
                <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {user.email}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Plan Badge */}
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>{user?.plan === 'pro' ? 'Pro Plan ($9/mo)' : 'Free Tier (50 Max)'}</span>
            </span>

            {/* Cursor API Key Modal Button */}
            <button
              onClick={() => setShowKeyModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium transition-colors"
            >
              <Key className="h-3.5 w-3.5" />
              <span>Cursor Key</span>
            </button>

            {/* Refresh */}
            <button
              onClick={() => {
                const t = localStorage.getItem("ctx_token");
                if (t) fetchUserData(t);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors"
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
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs uppercase font-medium text-slate-400">Total Memories</span>
              <div className="text-3xl font-extrabold text-white">{stats.total_memories}</div>
              <span className="text-xs text-slate-500">Indexed in your personal vault</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Database className="h-6 w-6" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs uppercase font-medium text-slate-400">Extracted Entities</span>
              <div className="text-3xl font-extrabold text-purple-400">{stats.entities}</div>
              <span className="text-xs text-slate-500">Entities in Knowledge Graph</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Brain className="h-6 w-6" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs uppercase font-medium text-slate-400">Graph Relations</span>
              <div className="text-3xl font-extrabold text-pink-400">{stats.relations}</div>
              <span className="text-xs text-slate-500">Directed relationship links</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Share2 className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab("graph")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "graph"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Share2 className="h-4 w-4" />
            <span>Knowledge Graph (Mindmap)</span>
          </button>
          <button
            onClick={() => setActiveTab("memories")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "memories"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database className="h-4 w-4" />
            <span>My Memories ({memories.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("recall")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "recall"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Search className="h-4 w-4" />
            <span>Recall Playground</span>
          </button>
        </div>

        {/* Tab 1: Knowledge Graph Canvas */}
        {activeTab === "graph" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg">Interactive Knowledge Graph</h2>
                  <p className="text-xs text-slate-400">
                    Click on any node to view its multi-hop connections extracted by Gemini 2.0 Flash.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-500">{graphData.nodes.length} nodes · {graphData.links.length} edges</span>
              </div>

              <div className="min-h-[350px] rounded-xl bg-slate-950/80 border border-slate-800/80 p-6 flex flex-wrap items-center justify-center gap-6 relative overflow-hidden">
                {graphData.nodes.length === 0 ? (
                  <div className="text-center text-slate-500 text-sm">No entities stored yet. Add a memory to populate the graph.</div>
                ) : (
                  graphData.nodes.map((node) => {
                    const isSelected = selectedNode?.id === node.id;
                    return (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={`p-4 rounded-2xl transition-all text-left flex flex-col gap-1.5 shadow-lg ${
                          isSelected
                            ? "bg-indigo-600 text-white scale-105 ring-4 ring-indigo-500/30"
                            : "bg-slate-900 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-850"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
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
                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-indigo-300">
                      Connections for: <strong className="text-white">{selectedNode.id}</strong> ({selectedNode.type})
                    </span>
                    <button onClick={() => setSelectedNode(null)} className="text-xs text-slate-400 hover:text-white">
                      Close
                    </button>
                  </div>
                  <div className="space-y-2">
                    {graphData.links
                      .filter(l => l.source === selectedNode.id || l.target === selectedNode.id)
                      .map((link, idx) => (
                        <div key={idx} className="text-xs font-mono text-slate-300 flex items-center gap-2">
                          <span className="font-bold text-indigo-400">{link.source}</span>
                          <span className="text-slate-500">--[{link.relation}]--&gt;</span>
                          <span className="font-bold text-purple-400">{link.target}</span>
                          {link.context && <span className="text-slate-500">({link.context})</span>}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Memories List */}
        {activeTab === "memories" && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 h-fit">
              <h2 className="font-semibold text-base flex items-center gap-2">
                <Plus className="h-4 w-4 text-indigo-400" />
                <span>Store Memory</span>
              </h2>
              <form onSubmit={handleAddMemory} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">Memory Content or Rule</label>
                  <textarea
                    rows={4}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="e.g. Always write pure functions for utility modules."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="e.g. conventions, frontend, rules"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all disabled:opacity-50"
                >
                  {isAdding ? "Extracting & Storing..." : "Save to Vault"}
                </button>
              </form>
            </div>

            <div className="md:col-span-2 space-y-4">
              <h2 className="font-semibold text-base text-slate-300">Saved Facts & Rules ({memories.length})</h2>
              <div className="space-y-3">
                {memories.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                    No memories found. Add your first codebase rule above!
                  </div>
                ) : (
                  memories.map((m) => (
                    <div
                      key={m.id}
                      className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-start justify-between gap-4 hover:border-slate-700 transition-all"
                    >
                      <div className="space-y-2">
                        <p className="text-sm text-slate-200 font-medium">{m.content}</p>
                        {m.summary && (
                          <p className="text-xs text-indigo-400/90 font-mono">Summary: {m.summary}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {m.tags && m.tags.map((t, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
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
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Delete Memory"
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

        {/* Tab 3: Recall Playground */}
        {activeTab === "recall" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                <span>Test Memory Retrieval (Hybrid Vector + Graph)</span>
              </h2>
              <form onSubmit={handleRecall} className="flex gap-3">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a question (e.g. Who maintains Apollo? What coding style do we use?)"
                  className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  <span>{isSearching ? "Recalling..." : "Recall"}</span>
                </button>
              </form>
            </div>

            {recallResult && (
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-indigo-500/40 space-y-3">
                <span className="text-xs uppercase font-bold text-indigo-400">Context Provided to AI Assistant:</span>
                <pre className="text-xs font-mono bg-slate-950 p-4 rounded-xl text-emerald-400 whitespace-pre-wrap leading-relaxed border border-slate-800">
                  {recallResult.formatted_context}
                </pre>
              </div>
            )}
          </div>
        )}
      </main>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-indigo-400" />
                <h3 className="font-bold text-lg">Your Cursor API Key</h3>
              </div>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Use this secret key to connect Cursor, Claude Code, or any external MCP client directly to your private ContextSync vault.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <code className="text-xs font-mono text-indigo-300 break-all">{user?.api_key}</code>
              <button
                onClick={handleCopyKey}
                className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shrink-0"
                title="Copy API Key"
              >
                {copiedKey ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs text-slate-400">
              <strong className="text-slate-300">How to use in Cursor:</strong>
              <p>Add header <code>X-API-Key: {user?.api_key}</code> to your MCP server configuration.</p>
            </div>

            <button
              onClick={() => setShowKeyModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
