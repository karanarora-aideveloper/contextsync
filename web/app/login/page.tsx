"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain, ArrowRight, Lock, Mail, AlertCircle, Sparkles } from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Login failed. Please check your credentials.");
      }

      // Save token and user details to localStorage
      localStorage.setItem("ctx_token", data.token);
      localStorage.setItem("ctx_user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Unable to connect to ContextSync backend.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail("developer@contextsync.dev");
    setPassword("password123");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-6 lg:px-8 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight">ContextSync</span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">Sign In to Your Memory Vault</h2>
        <p className="text-sm text-slate-400">
          Access your private Knowledge Graph and Cursor API keys.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/70 py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-800 backdrop-blur-md space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-medium text-slate-300">Email Address</label>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="block w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">Password</label>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? "Signing in..." : "Sign In"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="pt-2 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={fillDemoAccount}
              className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1.5"
            >
              <Sparkles className="h-3 w-3" />
              <span>Fill demo developer credentials</span>
            </button>
          </div>

          <div className="text-center text-xs text-slate-400">
            Don&apos;t have an account yet?{" "}
            <Link href="/signup" className="text-indigo-400 hover:underline font-semibold">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
