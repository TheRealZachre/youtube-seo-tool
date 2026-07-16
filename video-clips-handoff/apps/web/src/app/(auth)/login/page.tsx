import { Suspense } from "react";
import LoginPage from "./login-client";

export default function Page() {
  return (
    <Suspense fallback={<main className="p-10 text-muted">Loading…</main>}>
      <LoginPage />
    </Suspense>
  );
}
