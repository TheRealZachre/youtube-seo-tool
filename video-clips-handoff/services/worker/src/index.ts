import express from "express";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import type { WorkerJobPayload } from "@video-clips/shared";
import { processJob } from "./pipeline.js";

// Load .env if present (no dotenv dependency)
async function loadEnv() {
  try {
    const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env");
    const raw = await fs.readFile(envPath, "utf-8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    /* optional */
  }
}
await loadEnv();

const PORT = Number(process.env.PORT || 8787);
const SECRET = process.env.WORKER_WEBHOOK_SECRET ?? "dev-worker-secret";

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "video-clips-worker" });
});

app.post("/jobs", async (req, res) => {
  if (req.header("x-worker-secret") !== SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const payload = req.body as WorkerJobPayload;
  if (!payload?.projectId || !payload?.sourceType || !payload?.callbackUrl) {
    return res.status(400).json({ error: "Invalid job payload" });
  }

  res.status(202).json({ accepted: true, projectId: payload.projectId });

  setImmediate(() => {
    void processJob(payload).catch(async (err) => {
      console.error("[job failed]", payload.projectId, err);
      try {
        await fetch(payload.callbackUrl, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-worker-secret": SECRET,
          },
          body: JSON.stringify({
            type: "status",
            projectId: payload.projectId,
            status: "failed",
            error: err instanceof Error ? err.message : "Worker failed",
          }),
        });
      } catch (callbackErr) {
        console.error("[callback failed]", callbackErr);
      }
    });
  });
});

app.listen(PORT, () => {
  console.log(`[worker] listening on :${PORT}`);
});

process.on("SIGINT", async () => {
  try {
    await fs.rm(path.join(os.tmpdir(), "video-clips-worker"), { recursive: true, force: true });
  } catch {
    /* ignore */
  }
  process.exit(0);
});
