import Link from "next/link";
import { Terminal, Brain, Cpu, Database, ArrowRight, CheckCircle2, ShieldCheck, Zap, Layers, Sparkles } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              ContextSync
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              contextsync.dev
            </span>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <Link href="#features" className="text-slate-400 hover:text-white transition-colors hidden sm:block">
              Features
            </Link>
            <Link href="#pricing" className="text-slate-400 hover:text-white transition-colors hidden sm:block">
              Pricing
            </Link>
            <a
              href="https://github.com/karanarora-aideveloper/contextsync"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <GithubIcon className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <Link
              href="/login"
              className="text-slate-300 hover:text-white font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-md shadow-indigo-500/20 transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[600px] h-[600px] bg-indigo-500/15 rounded-full blur-3xl opacity-50" />
          <div className="w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Open-Core AI Memory Engine with Hybrid Knowledge Graph & Vector Search</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight md:leading-none">
            Never Re-Explain Your Code <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              To Your AI Again.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop repeating architecture decisions, conventions, and database schemas. ContextSync creates an interconnected 
            neural Knowledge Graph that Cursor, Claude Code, and Windsurf recall seamlessly.
          </p>

          {/* 1-Click Terminal Command */}
          <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-left shadow-2xl shadow-indigo-950/50">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono">1-Click Install into Cursor</span>
              </div>
              <span className="text-indigo-400 font-mono">Terminal</span>
            </div>
            <code className="text-sm font-mono text-indigo-300 block select-all">
              uvx --from git+https://github.com/karanarora-aideveloper/contextsync contextsync install-mcp cursor
            </code>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-xl bg-white text-slate-950 font-semibold hover:bg-slate-200 transition-all shadow-lg flex items-center gap-2"
            >
              <span>Launch Live Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://github.com/karanarora-aideveloper/contextsync"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-medium transition-all flex items-center gap-2"
            >
              <GithubIcon className="h-5 w-5" />
              <span>Star on GitHub</span>
            </a>
          </div>
        </div>
      </section>

      {/* Tri-Store Architecture Section */}
      <section id="features" className="py-20 px-6 border-t border-slate-900 bg-slate-950/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Under The Hood</h2>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight">The Hybrid Tri-Store Architecture</h3>
            <p className="text-slate-400">
              Unlike dumb RAG chunking, ContextSync mimics the human brain by fusing vector embeddings with relational graph memory.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/50 transition-all space-y-4">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Database className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-semibold">Embedded LanceDB Vectors</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Blazing fast, zero-server vector similarity search. Text embeddings are indexed instantly on disk with zero external database dependencies.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-purple-500/50 transition-all space-y-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Layers className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-semibold">SQLite Knowledge Graph</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Extracts entities and relationships into an interconnected web. Your AI can follow multi-hop connections across different services.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-pink-500/50 transition-all space-y-4">
              <div className="h-12 w-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <Zap className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-semibold">Gemini 2.0 Flash Extraction</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Powered by Google Gemini 2.0 Flash for structured JSON entity extraction in milliseconds at less than a fraction of a cent per memory.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 border-t border-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Simple & Transparent</h2>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight">Fair Pricing for Serious Builders</h3>
            <p className="text-slate-400">
              Run it 100% locally for free, or unlock seamless cross-device cloud synchronization.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Developer</span>
                <div className="text-4xl font-extrabold">$0 <span className="text-sm font-normal text-slate-500">/ forever</span></div>
                <p className="text-sm text-slate-400">For solo developers running everything locally on their laptop.</p>
              </div>

              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> 100% Local Open-Source Core</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Embedded LanceDB + SQLite</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Standard MCP for Cursor & Claude</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Offline Heuristic Mode</li>
              </ul>

              <a
                href="https://github.com/karanarora-aideveloper/contextsync"
                target="_blank"
                rel="noreferrer"
                className="w-full block text-center py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium transition-colors"
              >
                View on GitHub
              </a>
            </div>

            {/* Pro Tier */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-950/60 to-slate-900/90 border-2 border-indigo-500/60 shadow-xl shadow-indigo-950/40 space-y-6 relative">
              <div className="absolute -top-3 right-8 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold uppercase tracking-wider shadow">
                Most Popular
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">ContextSync Pro</span>
                <div className="text-4xl font-extrabold">$9 <span className="text-sm font-normal text-slate-400">/ month</span></div>
                <p className="text-sm text-slate-400">Or $89/year (2 months free). Sync across all your machines.</p>
              </div>

              <ul className="space-y-3 text-sm text-slate-200">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> Everything in Developer</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> **Cross-Device Sync** (Work Mac + PC + Laptop)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> **Web Dashboard & Visual Mindmap**</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> Managed Cloud Endpoints & Automatic Backups</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> Team Knowledge Sharing (Up to 3 members)</li>
              </ul>

              <Link
                href="/dashboard"
                className="w-full block text-center py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold transition-all shadow-md shadow-indigo-500/25"
              >
                Start with Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-900 text-center text-sm text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">ContextSync</span> &copy; 2026. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="https://github.com/karanarora-aideveloper/contextsync" className="hover:text-slate-300">GitHub</a>
            <Link href="/dashboard" className="hover:text-slate-300">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
