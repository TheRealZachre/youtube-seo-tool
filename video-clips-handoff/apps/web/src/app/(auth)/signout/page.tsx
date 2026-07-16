import { Suspense } from "react";
import SignOutPage from "./signout-client";

export default function Page() {
  return (
    <Suspense fallback={<main className="p-10 text-muted">Signing out…</main>}>
      <SignOutPage />
    </Suspense>
  );
}
