import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { listProjectsForUser } from "@/lib/projects/store";
import { JOB_STATUS_LABELS } from "@/lib/brand";
import { format } from "date-fns";

export default async function ProjectsPage() {
  const session = await getSession();
  if (!session) return null;
  const projects = await listProjectsForUser(session.userId);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">Projects</h1>
          <p className="mt-1 text-muted">Your clipping jobs, ranked by virality when ready.</p>
        </div>
        <Link
          href="/app/new"
          className="rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-navy-deep transition hover:bg-gold-soft"
        >
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="mt-12 border-t border-line pt-10">
          <p className="text-lg text-ink">No projects yet.</p>
          <p className="mt-1 text-muted">Add a YouTube URL, Drive file, or upload to create your first clips.</p>
          <Link href="/app/new" className="mt-6 inline-block text-sky underline-offset-2 hover:underline">
            Create clips →
          </Link>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-line border-t border-line">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/app/projects/${p.id}`}
                className="flex flex-col gap-1 py-5 transition hover:bg-white/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-navy">{p.title}</p>
                  <p className="text-sm text-muted">
                    {p.sourceType} · {format(new Date(p.createdAt), "MMM d, yyyy · HH:mm")}
                  </p>
                </div>
                <span
                  className={`mt-2 inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-semibold sm:mt-0 ${
                    p.jobStatus === "done"
                      ? "bg-sky/15 text-sky"
                      : p.jobStatus === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-gold/15 text-navy animate-pulse-soft"
                  }`}
                >
                  {JOB_STATUS_LABELS[p.jobStatus] ?? p.jobStatus}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
