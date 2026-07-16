import { CreateProjectForm } from "@/components/create-project-form";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";

export default async function NewProjectPage() {
  const session = await getSession();
  const user = session ? await findUserById(session.userId) : undefined;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-navy">New project</h1>
      <p className="mt-2 text-muted">
        Add a source. We&apos;ll transcribe, score the best moments, and render vertical captioned clips.
      </p>
      <CreateProjectForm hasGoogle={Boolean(user?.googleRefreshToken)} />
    </div>
  );
}
