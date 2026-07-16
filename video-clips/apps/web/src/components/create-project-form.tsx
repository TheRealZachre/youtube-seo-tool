"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { parseDriveFileId, parseYouTubeId } from "@video-clips/shared";

type SourceTab = "youtube" | "drive" | "upload";

export function CreateProjectForm({ hasGoogle }: { hasGoogle: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<SourceTab>("youtube");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [minDuration, setMinDuration] = useState(30);
  const [maxDuration, setMaxDuration] = useState(60);
  const [maxClips, setMaxClips] = useState(8);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const previewValid = useMemo(() => {
    if (tab === "youtube") return Boolean(parseYouTubeId(url));
    if (tab === "drive") return Boolean(parseDriveFileId(url));
    return Boolean(file);
  }, [tab, url, file]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let sourceKey: string | undefined;
      let sourceFileName: string | undefined;
      let sourceUrl: string | undefined = url.trim() || undefined;

      if (tab === "youtube" && !parseYouTubeId(url)) {
        throw new Error("Enter a valid YouTube URL or video ID.");
      }
      if (tab === "drive" && !parseDriveFileId(url)) {
        throw new Error("Enter a valid Google Drive file URL or ID.");
      }
      if (tab === "upload") {
        if (!file) throw new Error("Choose a video file to upload.");
        sourceFileName = file.name;
        const presign = await fetch("/api/media/presign", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type || "video/mp4",
            size: file.size,
          }),
        });
        const presignData = await presign.json();
        if (!presign.ok) throw new Error(presignData.error || "Could not start upload");
        sourceKey = presignData.key as string;

        if (presignData.mode === "local") {
          const form = new FormData();
          form.append("file", file);
          const up = await fetch(presignData.uploadUrl as string, { method: "POST", body: form });
          if (!up.ok) throw new Error("Upload failed");
        } else {
          const up = await fetch(presignData.uploadUrl as string, {
            method: "PUT",
            headers: { "content-type": file.type || "video/mp4" },
            body: file,
          });
          if (!up.ok) throw new Error("Upload to storage failed");
        }
        sourceUrl = undefined;
      }

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title || undefined,
          sourceType: tab,
          sourceUrl,
          sourceKey,
          sourceFileName,
          prefs: {
            minDurationSec: minDuration,
            maxDurationSec: maxDuration,
            maxClips,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create project");
      router.push(`/app/projects/${data.project.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-8">
      <div className="flex flex-wrap gap-2 border-b border-line pb-3">
        {(
          [
            ["youtube", "YouTube"],
            ["drive", "Google Drive"],
            ["upload", "Upload"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              tab === id ? "bg-navy text-white" : "text-muted hover:bg-white/60 hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab !== "upload" ? (
        <label className="block">
          <span className="text-sm font-medium text-ink">
            {tab === "youtube" ? "YouTube URL" : "Google Drive file URL"}
          </span>
          <input
            className="mt-1 w-full rounded-md border border-line bg-white/80 px-3 py-2.5 outline-none ring-sky focus:ring-2"
            placeholder={
              tab === "youtube"
                ? "https://www.youtube.com/watch?v=…"
                : "https://drive.google.com/file/d/…/view"
            }
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          {tab === "drive" && !hasGoogle && (
            <p className="mt-2 text-sm text-muted">
              Connect Google Drive for private files.{" "}
              <a href="/api/auth/google" className="text-sky underline-offset-2 hover:underline">
                Connect Drive
              </a>
            </p>
          )}
        </label>
      ) : (
        <label className="block">
          <span className="text-sm font-medium text-ink">Video file</span>
          <input
            type="file"
            accept="video/*,.mp4,.mov,.mkv,.webm"
            className="mt-1 block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-navy file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />
        </label>
      )}

      <label className="block">
        <span className="text-sm font-medium text-ink">Project title (optional)</span>
        <input
          className="mt-1 w-full rounded-md border border-line bg-white/80 px-3 py-2.5 outline-none ring-sky focus:ring-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Podcast episode 12"
        />
      </label>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-ink">Min length (sec)</span>
          <input
            type="number"
            min={15}
            max={180}
            className="mt-1 w-full rounded-md border border-line bg-white/80 px-3 py-2 outline-none ring-sky focus:ring-2"
            value={minDuration}
            onChange={(e) => setMinDuration(Number(e.target.value))}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Max length (sec)</span>
          <input
            type="number"
            min={20}
            max={180}
            className="mt-1 w-full rounded-md border border-line bg-white/80 px-3 py-2 outline-none ring-sky focus:ring-2"
            value={maxDuration}
            onChange={(e) => setMaxDuration(Number(e.target.value))}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Max clips</span>
          <input
            type="number"
            min={1}
            max={20}
            className="mt-1 w-full rounded-md border border-line bg-white/80 px-3 py-2 outline-none ring-sky focus:ring-2"
            value={maxClips}
            onChange={(e) => setMaxClips(Number(e.target.value))}
          />
        </label>
      </fieldset>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || !previewValid}
        className="rounded-md bg-gold px-6 py-3 font-semibold text-navy-deep transition hover:bg-gold-soft disabled:opacity-50"
      >
        {loading ? "Starting…" : "Get clips"}
      </button>
    </form>
  );
}
