export const VCF_CONTACT_EMAIL = "zach@vibecodeflow.com";
export const VCF_PRODUCT_NAME = "Video Clips";
export const VCF_BRAND = "Vibe.Code.Flow.";

export const NAV_LINKS = [
  { href: "/app", label: "Projects" },
  { href: "/app/new", label: "New clip" },
] as const;

export const JOB_STATUS_LABELS: Record<string, string> = {
  queued: "Queued",
  downloading: "Downloading source",
  transcribing: "Transcribing",
  scoring: "Scoring highlights",
  rendering: "Rendering clips",
  done: "Ready",
  failed: "Failed",
};
