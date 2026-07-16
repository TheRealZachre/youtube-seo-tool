"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignOutPage() {
  const router = useRouter();
  useEffect(() => {
    void (async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    })();
  }, [router]);
  return (
    <main className="mx-auto flex flex-1 items-center justify-center px-5 py-20 text-muted">
      Signing out…
    </main>
  );
}
