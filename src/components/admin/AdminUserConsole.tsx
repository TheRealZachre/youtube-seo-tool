"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Mail, Pencil, Shield, Trash2, UserPlus, Users, KeyRound, Check, X } from "lucide-react";
import type { PublicUser, UserRole } from "@/lib/auth/types";

const inputCls =
  "mt-1.5 w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-sky/50 focus:ring-2 focus:ring-sky/20";

// ── Edit User Panel ──────────────────────────────────────────────────────────
function EditUserPanel({ user, onSave, onCancel }: {
  user: PublicUser;
  onSave: (updated: PublicUser) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [username, setUsername] = useState(user.username ?? "");
  const [role, setRole] = useState<UserRole>(user.role);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, name, email, username: username || undefined, role }),
      });
      const data = await res.json() as { ok?: boolean; error?: string; user?: PublicUser };
      if (!res.ok) { setError(data.error ?? "Failed to save."); return; }
      onSave({ ...user, name, email, username: username || undefined, role });
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSave} className="mt-3 space-y-3 rounded-xl border border-sky/20 bg-sky/5 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-muted">Full name</label>
          <input className={inputCls} value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="text-xs font-medium text-muted">Email</label>
          <input className={inputCls} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="text-xs font-medium text-muted">Username</label>
          <input className={inputCls} value={username} onChange={e => setUsername(e.target.value)} placeholder="Optional" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted">Role</label>
          <select className={inputCls} value={role} onChange={e => setRole(e.target.value as UserRole)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky disabled:opacity-50">
          <Check className="h-3.5 w-3.5" />{loading ? "Saving…" : "Save changes"}
        </button>
        <button type="button" onClick={onCancel} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted transition hover:text-ink">
          <X className="h-3.5 w-3.5" />Cancel
        </button>
      </div>
    </form>
  );
}

// ── Set Password Panel ────────────────────────────────────────────────────────
function SetPasswordPanel({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/admin/users/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) { setError(data.error ?? "Failed."); return; }
      setSuccess("Password updated."); setPassword(""); setConfirm("");
      setTimeout(onDone, 1200);
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-xl border border-gold/20 bg-gold/5 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-muted">New password</label>
          <input className={inputCls} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 chars" required />
        </div>
        <div>
          <label className="text-xs font-medium text-muted">Confirm</label>
          <input className={inputCls} type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" required />
        </div>
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
      {success && <p className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">{success}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={loading || !password || !confirm} className="flex items-center gap-1.5 rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-navy-deep transition hover:bg-gold-soft disabled:opacity-50">
          <Check className="h-3.5 w-3.5" />{loading ? "Updating…" : "Set password"}
        </button>
        <button type="button" onClick={onDone} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted transition hover:text-ink">
          <X className="h-3.5 w-3.5" />Cancel
        </button>
      </div>
    </form>
  );
}

// ── User Row ─────────────────────────────────────────────────────────────────
function UserRow({ user, currentUserId, onUpdate, onDelete }: {
  user: PublicUser;
  currentUserId?: string;
  onUpdate: (u: PublicUser) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [panel, setPanel] = useState<"edit" | "password" | null>(null);
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [deleting, setDeleting] = useState(false);

  function togglePanel(p: "edit" | "password") {
    setExpanded(panel !== p || !expanded);
    setPanel(panel !== p ? p : null);
  }

  async function handleInvite() {
    setInviting(true); setInviteMsg(""); setInviteUrl("");
    try {
      const res = await fetch("/api/admin/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json() as { ok?: boolean; message?: string; devInviteUrl?: string };
      setInviteMsg(data.message ?? (res.ok ? "Invite sent." : "Failed."));
      if (data.devInviteUrl) setInviteUrl(data.devInviteUrl);
    } catch { setInviteMsg("Network error."); }
    finally { setInviting(false); }
  }

  async function handleDelete() {
    if (!confirm(`Delete account for ${user.name}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { alert(data.error ?? "Failed to delete."); return; }
      onDelete(user.id);
    } finally { setDeleting(false); }
  }

  return (
    <li className="rounded-xl border border-line/60 bg-cream/60">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/10 text-sm font-semibold text-navy">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-ink">{user.name}</p>
            {user.role === "admin" && (
              <span className="flex items-center gap-0.5 rounded-full bg-gold/15 px-1.5 py-0.5 text-xs font-medium text-gold">
                <Shield className="h-3 w-3" />Admin
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

        {/* Action buttons */}
        <div className="flex shrink-0 items-center gap-1">
          <button onClick={() => togglePanel("edit")} title="Edit user"
            className={`rounded-lg p-1.5 transition hover:bg-sky/10 hover:text-sky ${panel === "edit" ? "bg-sky/10 text-sky" : "text-muted"}`}>
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => togglePanel("password")} title="Set password"
            className={`rounded-lg p-1.5 transition hover:bg-gold/10 hover:text-gold ${panel === "password" ? "bg-gold/10 text-gold" : "text-muted"}`}>
            <KeyRound className="h-4 w-4" />
          </button>
          <button onClick={handleInvite} disabled={inviting} title="Send invite email"
            className="rounded-lg p-1.5 text-muted transition hover:bg-green-50 hover:text-green-600 disabled:opacity-40">
            <Mail className="h-4 w-4" />
          </button>
          {user.id !== currentUserId && (
            <button onClick={handleDelete} disabled={deleting} title="Delete user"
              className="rounded-lg p-1.5 text-muted transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button onClick={() => { setExpanded(e => !e); if (expanded) setPanel(null); }}
            className="rounded-lg p-1.5 text-muted transition hover:text-ink">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Invite feedback */}
      {inviteMsg && (
        <div className="border-t border-line/40 px-4 py-2">
          <p className="text-xs text-muted">{inviteMsg}</p>
          {inviteUrl && (
            <a href={inviteUrl} className="mt-1 block break-all text-xs text-sky hover:underline">{inviteUrl}</a>
          )}
        </div>
      )}

      {/* Expandable panels */}
      {expanded && panel === "edit" && (
        <div className="border-t border-line/40 px-4 pb-4">
          <EditUserPanel user={user} onSave={(u) => { onUpdate(u); setExpanded(false); setPanel(null); }} onCancel={() => { setExpanded(false); setPanel(null); }} />
        </div>
      )}
      {expanded && panel === "password" && (
        <div className="border-t border-line/40 px-4 pb-4">
          <SetPasswordPanel userId={user.id} onDone={() => { setExpanded(false); setPanel(null); }} />
        </div>
      )}
    </li>
  );
}

// ── Main Console ──────────────────────────────────────────────────────────────
export function AdminUserConsole({ initialUsers, currentUserId }: {
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

  const refreshUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (!res.ok) return;
    const data = await res.json() as { users: PublicUser[] };
    setUsers(data.users);
  }, []);

  useEffect(() => { void refreshUsers(); }, [refreshUsers]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null); setSuccess(null); setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, username: username || undefined, password, role }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) { setError(data.error ?? "Failed."); return; }
      setSuccess(`Account created for ${name}.`);
      setName(""); setEmail(""); setUsername(""); setPassword(""); setRole("user");
      await refreshUsers();
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
      {/* Create form */}
      <div className="rounded-2xl border border-line bg-white/85 p-6">
        <div className="mb-5 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-sky" />
          <h2 className="font-display text-lg font-semibold text-navy">Create user account</h2>
        </div>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink">Full name</label>
            <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" required />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Email</label>
            <input className={inputCls} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" required />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Username <span className="text-muted">(optional)</span></label>
            <input className={inputCls} value={username} onChange={e => setUsername(e.target.value)} placeholder="janesmith" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Password</label>
            <input className={inputCls} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" required />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Role</label>
            <select className={inputCls} value={role} onChange={e => setRole(e.target.value as UserRole)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          {success && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>}
          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky disabled:opacity-50">
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
      </div>

      {/* User list */}
      <div className="rounded-2xl border border-line bg-white/85 p-6">
        <div className="mb-5 flex items-center gap-2">
          <Users className="h-5 w-5 text-sky" />
          <h2 className="font-display text-lg font-semibold text-navy">Existing users</h2>
          <span className="ml-auto rounded-full bg-navy/8 px-2.5 py-0.5 text-xs font-medium text-navy">{users.length}</span>
        </div>

        {/* Legend */}
        <div className="mb-4 flex flex-wrap gap-3 text-xs text-muted">
          <span className="flex items-center gap-1"><Pencil className="h-3 w-3" /> Edit</span>
          <span className="flex items-center gap-1"><KeyRound className="h-3 w-3" /> Set password</span>
          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> Send invite</span>
          <span className="flex items-center gap-1"><Trash2 className="h-3 w-3" /> Delete</span>
        </div>

        {users.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">No users yet — create the first account.</p>
        ) : (
          <ul className="space-y-2">
            {users.map(user => (
              <UserRow
                key={user.id}
                user={user}
                currentUserId={currentUserId}
                onUpdate={updated => setUsers(us => us.map(u => u.id === updated.id ? updated : u))}
                onDelete={id => setUsers(us => us.filter(u => u.id !== id))}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
