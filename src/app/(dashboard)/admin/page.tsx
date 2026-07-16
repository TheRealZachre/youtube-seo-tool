import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { listUsers } from "@/lib/auth/users";
import { AdminUserConsole } from "@/components/admin/AdminUserConsole";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Platform Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/");

  const users = await listUsers();

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <p className="text-sm font-semibold uppercase tracking-widest text-sky">Platform</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-navy">Admin Console</h1>
      <p className="mt-2 text-muted">
        Create username and password accounts for this platform.
      </p>

      <div className="mt-8">
        <AdminUserConsole initialUsers={users} currentUserId={session.userId} />
      </div>
    </div>
  );
}
