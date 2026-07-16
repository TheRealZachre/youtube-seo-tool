"use client";

import { useEffect, useState } from "react";
import type { ClipRecord, JobStatus, ProjectRecord } from "@video-clips/shared";
import { JOB_STATUS_LABELS } from "@/lib/brand";
import { formatDuration } from "@/lib/utils";

interface ProjectPayload {
  project: ProjectRecord;
  clips: ClipRecord[];
  mediaUrls: Record<string, string>;
}

export function ProjectLiveView({
  initial,
}: {
  initial: ProjectPayload;
}) {
  const [data, setData] = useState(initial);
  const active =
    data.project.jobStatus !== "done" && data.project.jobStatus !== "failed";

  useEffect(() => {
    if (!active) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/projects/${data.project.id}`);
        if (!res.ok) return;
        const next = (await res.json()) as ProjectPayload;
        setData(next);
      } catch {
        /* ignore */
      }
    }, 2500);
    return () => clearInterval(id);
  }, [active, data.project.id]);

  async function retry() {
    const res = await fetch(`/api/projects/${data.project.id}/retry`, { method: "POST" });
    if (res.ok) {
      const next = (await res.json()) as ProjectPayload;
      setData(next);
    }
  }

  const status = data.project.jobStatus as JobStatus;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wider text-sky">{data.project.sourceType}</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-navy">{data.project.title}</h1>
          <p className="mt-2 text-muted">
            {JOB_STATUS_LABELS[status] ?? status}
            {data.project.jobProgress ? ` · ${data.project.jobProgress}` : ""}
          </p>
        </div>
        {status === "failed" && (
          <button
            type="button"
            onClick={() => void retry()}
            className="rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep"
          >
            Retry
          </button>
        )}
      </div>

      {active && (
        <div className="mt-8 rounded-md border border-line bg-white/60 px-5 py-6">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 animate-pulse-soft rounded-full bg-sky" />
            <p className="font-medium text-ink">Processing your video…</p>
          </div>
          <p className="mt-2 text-sm text-muted">
            Typical short sources finish in a few minutes. This page updates automatically.
          </p>
          <ol className="mt-5 grid gap-2 text-sm text-muted sm:grid-cols-5">
            {(["queued", "downloading", "transcribing", "scoring", "rendering"] as JobStatus[]).map(
              (step) => (
                <li
                  key={step}
                  className={
                    step === status ? "font-semibold text-sky" : statusOrder(status) > statusOrder(step) ? "text-ink" : ""
                  }
                >
                  {JOB_STATUS_LABELS[step]}
                </li>
              )
            )}
          </ol>
        </div>
      )}

      {status === "failed" && (
        <div className="mt-8 border-l-4 border-red-500 bg-red-50 px-4 py-3 text-red-800">
          {data.project.jobError || "Processing failed."}
        </div>
      )}

      {data.clips.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-2xl font-semibold text-navy">Ranked clips</h2>
          <p className="mt-1 text-muted">Sorted by virality score — hook, flow, value, and trend.</p>
          <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {data.clips.map((clip) => {
              const mediaUrl = clip.mediaKey ? data.mediaUrls[clip.mediaKey] : undefined;
              return (
                <li key={clip.id} className="border-t border-line pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                        #{clip.rank}
                      </p>
                      <h3 className="mt-1 font-display text-lg font-semibold text-navy">{clip.title}</h3>
                    </div>
                    <div
                      className="score-ring flex h-14 w-14 shrink-0 items-center justify-center rounded-full p-[3px]"
                      style={{ ["--score" as string]: clip.viralityScore }}
                    >
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-cream text-sm font-bold text-navy">
                        {clip.viralityScore}
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    {formatDuration(clip.durationSec)} · {clip.hook}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink/80">{clip.reason}</p>
                  {mediaUrl ? (
                    <div className="mt-4 space-y-3">
                      <video
                        src={mediaUrl}
                        controls
                        playsInline
                        className="aspect-[9/16] w-full max-w-[220px] bg-navy-deep object-cover"
                      />
                      <a
                        href={mediaUrl}
                        download
                        className="inline-flex text-sm font-semibold text-sky underline-offset-2 hover:underline"
                      >
                        Download MP4
                      </a>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-muted">Media rendering…</p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function statusOrder(status: JobStatus): number {
  const order: JobStatus[] = [
    "queued",
    "downloading",
    "transcribing",
    "scoring",
    "rendering",
    "done",
    "failed",
  ];
  return order.indexOf(status);
}
