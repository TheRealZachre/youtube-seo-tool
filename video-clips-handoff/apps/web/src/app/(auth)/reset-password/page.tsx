"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { VCF_PRODUCT_NAME } from "@/lib/brand";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Reset failed.");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-white">Invalid reset link. Please request a new one.</p>
        <Link href="/forgot-password" className="mt-4 block text-sm text-sky-soft/60 hover:text-white">
          Request new link →
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-8 shadow-2xl backdrop-blur-sm">
      {done ? (
        <div className="text-center">
          <h1 className="font-display text-xl font-semibold text-white">Password updated</h1>
          <p className="mt-2 text-sm text-sky-soft/70">Redirecting you to sign in…</p>
        </div>
      ) : (
        <>
          <h1 className="font-display text-xl font-semibold text-white">Set new password</h1>
          <p className="mt-1 text-sm text-sky-soft/60">Choose a strong password — at least 8 characters.</p>
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">New password</label>
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full rounded-lg border border-white/15 bg-white/8 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-sky/50 focus:ring-2 focus:ring-sky/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                className="w-full rounded-lg border border-white/15 bg-white/8 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-sky/50 focus:ring-2 focus:ring-sky/20"
              />
            </div>
            {error && <p className="rounded-lg bg-red-900/40 px-3 py-2 text-sm text-red-300">{error}</p>}
            <button
              type="submit"
              disabled={loading || !password || !confirm}
              className="w-full rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-navy-deep transition hover:bg-gold-soft disabled:opacity-50"
            >
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
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
        <Suspense fallback={<p className="text-center text-sky-soft/60">Loading…</p>}>
          <ResetForm />
        </Suspense>
        <p className="mt-6 text-center text-xs text-white/30">
          <Link href="/login" className="hover:text-white/60">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
