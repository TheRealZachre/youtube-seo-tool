import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
