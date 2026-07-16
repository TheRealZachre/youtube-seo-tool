"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { VCF_PRODUCT_NAME } from "@/lib/brand";

export default function ForgotPasswordPage() {
  const [login, setLogin] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devUrl, setDevUrl] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; devResetUrl?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSent(true);
      if (data.devResetUrl) setDevUrl(data.devResetUrl);
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
            src="/vcf-logo-horizontal.png"
            alt="Vibe.Code.Flow."
            style={{ height: "30px", width: "auto", display: "inline-block" }}
          />
          <p className="mt-2 text-sm text-sky-soft/60">{VCF_PRODUCT_NAME}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/8 p-8 shadow-2xl backdrop-blur-sm">
          {sent ? (
            <div className="text-center">
              <h1 className="font-display text-xl font-semibold text-white">Check your email</h1>
              <p className="mt-2 text-sm text-sky-soft/70">
                If an account exists for that email or username, we&apos;ve sent a reset link. It expires in 1
                hour.
              </p>
              {devUrl && (
                <div className="mt-4 rounded-lg bg-gold/10 p-3 text-left">
                  <p className="text-xs font-semibold text-gold-soft">Dev mode — no email sent</p>
                  <a href={devUrl} className="mt-1 block break-all text-xs text-sky-soft/80 hover:underline">
                    {devUrl}
                  </a>
                </div>
              )}
              <Link href="/login" className="mt-6 block text-sm text-sky-soft/60 hover:text-white">
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-xl font-semibold text-white">Forgot password</h1>
              <p className="mt-1 text-sm text-sky-soft/60">
                Enter your email or username and we&apos;ll send a reset link.
              </p>
              <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white/80">Email or username</label>
                  <input
                    type="text"
                    autoFocus
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    placeholder="you@example.com or username"
                    className="w-full rounded-lg border border-white/15 bg-white/8 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-sky/50 focus:ring-2 focus:ring-sky/20"
                  />
                </div>
                {error && <p className="rounded-lg bg-red-900/40 px-3 py-2 text-sm text-red-300">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !login.trim()}
                  className="w-full rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-navy-deep transition hover:bg-gold-soft disabled:opacity-50"
                >
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
              <Link href="/login" className="mt-5 block text-center text-sm text-sky-soft/50 hover:text-white">
                ← Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
