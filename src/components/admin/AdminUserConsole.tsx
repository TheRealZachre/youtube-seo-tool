"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Shield, Trash2, UserPlus, Users } from "lucide-react";
import type { PublicUser, UserRole } from "@/lib/auth/types";

const inputCls =
  "mt-1.5 w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-sky/50 focus:ring-2 focus:ring-sky/20";

export function AdminUserConsole({
  initialUsers,
  currentUserId,
}: {
  initialUsers: PublicUser[];
  currentUserId?: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refreshUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (!res.ok) return;
    const data = await res.json() as { users: PublicUser[] };
    setUsers(data.users);
  }, []);

  useEffect(() => { void refreshUsers(); }, [refreshUsers]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, username: username || undefined, password, role }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) { setError(data.error ?? "Failed to create user."); return; }
      setSuccess(`Account created for ${name}.`);
      setName(""); setEmail(""); setUsername(""); setPassword(""); setRole("user");
      await refreshUsers();
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(userId: string, userName: string) {
    if (!confirm(`Delete account for ${userName}? This cannot be undone.`)) return;
    setDeletingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { alert(data.error ?? "Failed to delete."); return; }
      await refreshUsers();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
      {/* Create user form */}
      <div className="rounded-2xl border border-line bg-white/85 p-6">
        <div className="mb-5 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-sky" />
          <h2 className="font-display text-lg font-semibold text-navy">Create user account</h2>
        </div>
        <p className="mb-5 text-sm text-muted">Set a username and password so someone can sign in immediately.</p>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink">Full name</label>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" required />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Email</label>
            <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" required />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Username <span className="text-muted">(optional)</span></label>
            <input className={inputCls} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="janesmith" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Password</label>
            <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" required />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Role</label>
            <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          {success && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
      </div>

      {/* User list */}
      <div className="rounded-2xl border border-line bg-white/85 p-6">
        <div className="mb-5 flex items-center gap-2">
          <Users className="h-5 w-5 text-sky" />
          <h2 className="font-display text-lg font-semibold text-navy">Existing users</h2>
          <span className="ml-auto rounded-full bg-navy/8 px-2.5 py-0.5 text-xs font-medium text-navy">
            {users.length}
          </span>
        </div>

        {users.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">No users yet — create the first account.</p>
        ) : (
          <ul className="space-y-2">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex items-center gap-3 rounded-xl border border-line/60 bg-cream/60 px-4 py-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/10 text-sm font-semibold text-navy">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-ink">{user.name}</p>
                    {user.role === "admin" && (
                      <span className="flex items-center gap-0.5 rounded-full bg-gold/15 px-1.5 py-0.5 text-xs font-medium text-gold">
                        <Shield className="h-3 w-3" />
                        Admin
                      </span>
                    )}
                    {user.id === currentUserId && (
                      <span className="rounded-full bg-sky/10 px-1.5 py-0.5 text-xs font-medium text-sky">You</span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted">
                    {user.email}{user.username ? ` · @${user.username}` : ""}
                  </p>
                </div>
                {user.id !== currentUserId && (
                  <button
                    onClick={() => handleDelete(user.id, user.name)}
                    disabled={deletingId === user.id}
                    className="shrink-0 rounded-lg p-1.5 text-muted transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                    title="Delete user"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
