"use client";

import { useState, useRef, FormEvent, DragEvent } from "react";
import { FileVideo, Link2, FileText, Loader2, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import type { SeoPackage } from "@/app/api/generate-seo/route";

type InputType = "transcript" | "url" | "file";

interface Result {
  package: SeoPackage;
  transcript: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-muted transition hover:bg-navy/8 hover:text-navy"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function ResultPanel({ result }: { result: Result }) {
  const pkg = result.package;
  const [chaptersOpen, setChaptersOpen] = useState(true);

  const fullDescription = `${pkg.description}\n\n⏱ CHAPTERS\n${pkg.chapters.map((c) => `${c.timestamp} ${c.label}`).join("\n")}`;

  return (
    <div className="mt-10 space-y-5">
      {/* Score banner */}
      <div className="flex items-center justify-between rounded-2xl bg-navy px-6 py-4 text-white">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-soft">SEO Score</p>
          <p className="mt-0.5 font-display text-4xl font-semibold">{pkg.seoScore}<span className="text-lg text-white/50">/100</span></p>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-sky-soft/80">{pkg.reasoning}</p>
      </div>

      {/* Title */}
      <div className="rounded-2xl border border-line bg-white/85 p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">Optimized Title</p>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${pkg.titleCharCount > 70 ? "text-red-500" : "text-green-600"}`}>
              {pkg.titleCharCount} / 70 chars
            </span>
            <CopyButton text={pkg.title} />
          </div>
        </div>
        <p className="font-display text-xl font-semibold text-navy">{pkg.title}</p>
      </div>

      {/* Description */}
      <div className="rounded-2xl border border-line bg-white/85 p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">Description</p>
          <CopyButton text={fullDescription} />
        </div>
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink">{pkg.description}</pre>
      </div>

      {/* Chapters */}
      <div className="rounded-2xl border border-line bg-white/85 p-5">
        <button
          className="flex w-full items-center justify-between"
          onClick={() => setChaptersOpen((o) => !o)}
        >
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Chapters</p>
            <span className="rounded-full bg-navy/8 px-2 py-0.5 text-xs font-medium text-navy">{pkg.chapters.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <CopyButton text={pkg.chapters.map((c) => `${c.timestamp} ${c.label}`).join("\n")} />
            {chaptersOpen ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
          </div>
        </button>
        {chaptersOpen && (
          <ul className="mt-3 space-y-1.5">
            {pkg.chapters.map((ch, i) => (
              <li key={i} className="flex items-center gap-3 rounded-lg bg-cream/80 px-3 py-2 text-sm">
                <span className="w-12 shrink-0 font-mono text-xs font-medium text-sky">{ch.timestamp}</span>
                <span className="text-ink">{ch.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tags */}
      <div className="rounded-2xl border border-line bg-white/85 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Tags</p>
            <span className="rounded-full bg-navy/8 px-2 py-0.5 text-xs font-medium text-navy">{pkg.tags.length}</span>
          </div>
          <CopyButton text={pkg.tags.join(", ")} />
        </div>
        <div className="flex flex-wrap gap-2">
          {pkg.tags.map((tag, i) => (
            <span key={i} className="rounded-full border border-line bg-cream px-3 py-1 text-xs font-medium text-ink">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Thumbnail & End Screen */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white/85 p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">Thumbnail Notes</p>
          <p className="text-sm leading-relaxed text-ink">{pkg.thumbnailNotes}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white/85 p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">End Screen Notes</p>
          <p className="text-sm leading-relaxed text-ink">{pkg.endScreenNotes}</p>
        </div>
      </div>

      {/* Transcript preview */}
      {result.transcript && (
        <details className="rounded-2xl border border-line bg-white/60 p-5">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-muted">
            Transcript preview
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted">{result.transcript}</p>
        </details>
      )}
    </div>
  );
}

export function SeoGeneratorClient() {
  const [inputType, setInputType] = useState<InputType>("url");
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs: { id: InputType; label: string; icon: typeof Link2 }[] = [
    { id: "url", label: "YouTube URL", icon: Link2 },
    { id: "transcript", label: "Paste transcript", icon: FileText },
    { id: "file", label: "Upload video / audio", icon: FileVideo },
  ];

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.set("inputType", inputType);
      if (inputType === "url") fd.set("url", url);
      if (inputType === "transcript") fd.set("transcript", transcript);
      if (inputType === "file" && file) fd.set("file", file);

      const res = await fetch("/api/generate-seo", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit =
    (inputType === "url" && url.trim()) ||
    (inputType === "transcript" && transcript.trim()) ||
    (inputType === "file" && file != null);

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-1 rounded-xl border border-line bg-white/60 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setInputType(tab.id); setError(""); setResult(null); }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              inputType === tab.id
                ? "bg-navy text-white shadow-sm"
                : "text-muted hover:text-navy"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Input form */}
      <form onSubmit={onSubmit} className="mt-5">
        {inputType === "url" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">YouTube video URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none ring-sky/30 focus:border-sky/40 focus:ring-2"
            />
            <p className="mt-1.5 text-xs text-muted">Works best with videos that have English captions / auto-generated subtitles enabled.</p>
          </div>
        )}

        {inputType === "transcript" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Video transcript</label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste the full transcript here — from YouTube's transcript panel, a .srt file, or any text source…"
              rows={10}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none ring-sky/30 focus:border-sky/40 focus:ring-2"
            />
            <p className="mt-1.5 text-xs text-muted">{transcript.length.toLocaleString()} characters · aim for at least 200 words for best results.</p>
          </div>
        )}

        {inputType === "file" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Video or audio file</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 transition ${
                dragging ? "border-sky bg-sky/5" : "border-line bg-white/60 hover:border-sky/50 hover:bg-sky/3"
              }`}
            >
              <FileVideo className="h-10 w-10 text-muted" />
              {file ? (
                <div className="text-center">
                  <p className="font-medium text-navy">{file.name}</p>
                  <p className="text-sm text-muted">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-medium text-navy">Drop a file or click to browse</p>
                  <p className="mt-1 text-sm text-muted">MP4, MOV, WEBM, MP3, WAV — up to 25 MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,audio/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }}
            />
          </div>
        )}

        {error && (
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-sky disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {inputType === "file" ? "Transcribing & generating…" : "Generating SEO package…"}
            </>
          ) : (
            "Generate full SEO package →"
          )}
        </button>
      </form>

      {result && <ResultPanel result={result} />}
    </div>
  );
}
