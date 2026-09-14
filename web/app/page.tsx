"use client";

import Link from "next/link";
import { Brain, Sparkles, Database, Layers, CheckCircle2, ChevronRight, Zap, Code2, Cpu } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-indigo-500 selection:text-white font-sans">
      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20 border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-white dark:bg-slate-900">
              <img 
                src="/logo.jpg" 
                alt="ContextSync Logo" 
                className="h-full w-full object-cover"
              />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              ContextSync
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Pricing</a>
            <a href="https://github.com/karanarora-aideveloper/contextsync" target="_blank" rel="noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">GitHub</a>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="hidden md:inline-flex text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="text-sm font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 px-5 py-2.5 rounded-full transition-all shadow-sm hover:shadow active:scale-95"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-semibold shadow-sm mx-auto">
            <Sparkles className="h-4 w-4" />
            <span>Now Powered by Advanced AI for Flawless Entity Extraction</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Give Your AI Agents <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              Infinite Memory.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop repeating architecture decisions, styling conventions, and database schemas. ContextSync builds a permanent <strong>Knowledge Graph</strong> that Cursor, Claude Code, and Windsurf can instantly recall.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
            >
              Start Syncing for Free
              <ChevronRight className="h-5 w-5" />
            </Link>
            <a 
              href="https://github.com/karanarora-aideveloper/contextsync"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-sm active:scale-95"
            >
              <Code2 className="h-5 w-5" />
              View Documentation
            </a>
          </div>

          {/* Social Proof / IDE Support */}
          <div className="pt-16 border-t border-slate-200/50 dark:border-slate-800/50 mt-16 max-w-3xl mx-auto">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">Natively Connects With</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs">C</div> Cursor
              </span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-orange-500 text-white flex items-center justify-center text-xs">AI</div> Claude Code
              </span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-blue-500 text-white flex items-center justify-center text-xs">VS</div> VS Code (Roo)
              </span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-indigo-500 text-white flex items-center justify-center text-xs">AG</div> Antigravity
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-900">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Built for Agentic Coding</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">ContextSync isn't just a database. It's a dual-engine architecture designed specifically to feed Large Language Models the exact context they need.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-lg transition-all group">
              <div className="h-14 w-14 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="h-7 w-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Advanced AI Engine</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Uses advanced AI inference to parse your unstructured rules and automatically extract highly structured JSON entities and conceptual relationships.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 hover:shadow-lg transition-all group">
              <div className="h-14 w-14 rounded-2xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layers className="h-7 w-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Graph + Vector Hybrid</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Combines SQLite Knowledge Graphs for logical relational tracing and LanceDB for high-speed semantic vector similarity search.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-pink-500/50 hover:shadow-lg transition-all group">
              <div className="h-14 w-14 rounded-2xl bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-7 w-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Universal MCP Standard</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Built natively on Anthropic's Model Context Protocol (MCP). It runs securely in your local environment via stdio and connects to any compliant AI IDE instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 border-t border-slate-200 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Simple Pricing</h2>
            <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">Fair pricing for serious builders.</h3>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Start local for free, or go Pro to get full cross-device synchronization and visual dashboards. No BYOK complexity—we cover the AI costs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            {/* Free Tier */}
            <div className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <div className="space-y-4 mb-8">
                <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300">Free Tier</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-slate-900 dark:text-white">$0</span>
                  <span className="text-slate-500 font-medium">/ forever</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">Perfect for solo developers working on a single machine.</p>
              </div>

              <div className="flex-1 space-y-6">
                <ul className="space-y-4 text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-3"><CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" /> <span><strong>50 Memory Credits</strong> included</span></li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" /> <span>Standard MCP Connection (Cursor, Claude)</span></li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" /> <span>Local SQLite & LanceDB storage</span></li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" /> <span>Access to Dashboard UI</span></li>
                </ul>
              </div>

              <Link
                href="/signup"
                className="mt-8 w-full block text-center py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="p-10 rounded-[2.5rem] bg-slate-900 dark:bg-slate-900 border border-slate-800 dark:border-slate-700 shadow-2xl relative flex flex-col text-white">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/20 to-purple-600/20 pointer-events-none" />
              <div className="absolute -inset-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 -z-10 opacity-50 blur-sm" />

              <div className="relative z-10 space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 text-sm font-bold">Pro</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Most Popular</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-white">$9</span>
                  <span className="text-slate-400 font-medium">/ month</span>
                </div>
                <p className="text-slate-300">For serious engineers who work across multiple machines and want unlimited memory.</p>
              </div>

              <div className="relative z-10 flex-1 space-y-6">
                <ul className="space-y-4 text-slate-200">
                  <li className="flex items-start gap-3"><CheckCircle2 className="h-6 w-6 text-indigo-400 shrink-0" /> <span><strong>Unlimited Memory Credits</strong></span></li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="h-6 w-6 text-indigo-400 shrink-0" /> <span><strong>AI Engine Costs Included</strong></span></li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="h-6 w-6 text-indigo-400 shrink-0" /> <span><strong>Cross-Device Sync</strong> (Mac, PC, Laptop)</span></li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="h-6 w-6 text-indigo-400 shrink-0" /> <span>Interactive 2D Force-Graph Brain Map</span></li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="h-6 w-6 text-indigo-400 shrink-0" /> <span>Priority Support</span></li>
                </ul>
              </div>

              <Link
                href="/signup"
                className="relative z-10 mt-8 w-full block text-center py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/25"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 text-center text-sm text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center">
               <img src="/logo.jpg" alt="Logo" className="h-full w-full object-cover opacity-80 grayscale" />
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-300">ContextSync</span> &copy; 2026. All rights reserved.
          </div>
          <div className="flex gap-8 font-medium">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">Pricing</a>
            <a href="https://github.com/karanarora-aideveloper/contextsync" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">GitHub</a>
            <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
