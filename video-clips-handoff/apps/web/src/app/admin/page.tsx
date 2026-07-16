import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminUserConsole } from "@/components/admin/AdminUserConsole";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getSession } from "@/lib/auth/session";
import { listUsers } from "@/lib/auth/users";

export const metadata: Metadata = { title: "Platform Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login?from=/admin");
  if (session.role !== "admin") redirect("/app");

  const users = await listUsers();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-sky">Platform</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-navy">Admin Console</h1>
        <p className="mt-2 text-muted">
          Create and manage username/password accounts for Video Clips — same platform admin as BeOne.
        </p>
        <div className="mt-8">
          <AdminUserConsole initialUsers={users} currentUserId={session.userId} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
