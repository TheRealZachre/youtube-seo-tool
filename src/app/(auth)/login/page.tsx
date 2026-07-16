"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/";

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password, from }),
      });
      const data = await res.json() as { ok?: boolean; redirect?: string; error?: string };
      if (res.ok && data.ok) {
        router.push(data.redirect ?? "/");
        router.refresh();
      } else {
        setError(data.error ?? "Login failed.");
        setPassword("");
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-navy-deep px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img
            src="/vcf-logo-stacked.png"
            alt="Vibe.Code.Flow."
            style={{ height: "180px", width: "auto", display: "inline-block" }}
          />
          <p className="mt-3 text-sm text-sky-soft/60">YouTube SEO Platform</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/8 p-8 shadow-2xl backdrop-blur-sm">
          <h1 className="font-display text-xl font-semibold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-sky-soft/60">Sign in to access your dashboard.</p>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label htmlFor="login" className="mb-1.5 block text-sm font-medium text-white/80">
                Email or username
              </label>
              <input
                id="login"
                type="text"
                autoFocus
                autoComplete="username"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="you@example.com or username"
                className="w-full rounded-lg border border-white/15 bg-white/8 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-sky/50 focus:ring-2 focus:ring-sky/20"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white/80">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/15 bg-white/8 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-sky/50 focus:ring-2 focus:ring-sky/20"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-900/40 px-3 py-2 text-sm text-red-300">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !login.trim() || !password}
              className="w-full rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-navy-deep transition hover:bg-gold-soft disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <Link href="/forgot-password" className="block text-center text-sm text-sky-soft/50 hover:text-white">
              Forgot password?
            </Link>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/30">
          Vibe.Code.Flow. ·{" "}
          <a href="mailto:zach@vibecodeflow.com" className="hover:text-white/60">
            zach@vibecodeflow.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
