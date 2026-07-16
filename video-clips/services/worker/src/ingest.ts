import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { parseDriveFileId, parseYouTubeId } from "@video-clips/shared";
import { downloadSourceKey } from "./callback.js";

function run(cmd: string, args: string[], cwd?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} failed (${code}): ${stderr.slice(-2000)}`));
    });
  });
}

async function downloadYouTube(urlOrId: string, outDir: string): Promise<string> {
  const ytDlp = process.env.YT_DLP_PATH || "yt-dlp";
  const id = parseYouTubeId(urlOrId) || urlOrId;
  const outTemplate = path.join(outDir, "source.%(ext)s");
  const jsRuntime = process.env.YT_DLP_JS_RUNTIME || "node";
  const common = [
    "--js-runtimes",
    jsRuntime,
    "-f",
    "bv*[height<=1080]+ba/b[height<=1080]/b",
    "--merge-output-format",
    "mp4",
    "-o",
    outTemplate,
    "--no-playlist",
    "--extractor-args",
    "youtube:player_client=android,web",
  ];

  const url = `https://www.youtube.com/watch?v=${id}`;
  const cookieArgs =
    process.env.YT_DLP_COOKIES && (await fs.stat(process.env.YT_DLP_COOKIES).then(() => true).catch(() => false))
      ? ["--cookies", process.env.YT_DLP_COOKIES]
      : [];

  try {
    await run(ytDlp, [...common, ...cookieArgs, url]);
  } catch (firstErr) {
    // Fallback client set for bot-check / age-gate edge cases
    try {
      await run(ytDlp, [
        "--js-runtimes",
        jsRuntime,
        ...cookieArgs,
        "-f",
        "b[height<=720]/best",
        "--merge-output-format",
        "mp4",
        "-o",
        outTemplate,
        "--no-playlist",
        "--extractor-args",
        "youtube:player_client=ios,tv",
        url,
      ]);
    } catch {
      const hint =
        "YouTube blocked the download (bot check). Set YT_DLP_COOKIES to a Netscape cookies.txt export, or use Upload / Drive.";
      const detail = firstErr instanceof Error ? firstErr.message : String(firstErr);
      throw new Error(`${hint}\n\n${detail.slice(0, 500)}`);
    }
  }
  const files = await fs.readdir(outDir);
  const video = files.find((f) => f.startsWith("source."));
  if (!video) throw new Error("yt-dlp did not produce a file");
  return path.join(outDir, video);
}

async function refreshGoogleAccessToken(refreshToken: string): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID/SECRET required for Drive downloads");
  }
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const json = (await res.json()) as { access_token?: string; error?: string };
  if (!res.ok || !json.access_token) {
    throw new Error(`Drive token refresh failed: ${json.error || res.status}`);
  }
  return json.access_token;
}

async function downloadDrive(fileUrlOrId: string, refreshToken: string | undefined, outDir: string): Promise<string> {
  const fileId = parseDriveFileId(fileUrlOrId);
  if (!fileId) throw new Error("Invalid Google Drive URL");

  const dest = path.join(outDir, "source.mp4");

  if (refreshToken) {
    const accessToken = await refreshGoogleAccessToken(refreshToken);
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      throw new Error(`Drive download failed (${res.status}). Share the file or reconnect Google.`);
    }
    await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
    return dest;
  }

  // Public file fallback via Googleusercontent
  const publicUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const res = await fetch(publicUrl);
  if (!res.ok) {
    throw new Error(
      "Drive file is not publicly downloadable. Connect Google Drive in the app or share the file as Anyone with the link."
    );
  }
  await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return dest;
}

export async function ingestSource(opts: {
  sourceType: "youtube" | "drive" | "upload";
  sourceUrl?: string;
  sourceKey?: string;
  appUrl: string;
  workDir: string;
  driveRefreshToken?: string;
}): Promise<string> {
  if (opts.sourceType === "youtube") {
    if (!opts.sourceUrl) throw new Error("YouTube URL missing");
    return downloadYouTube(opts.sourceUrl, opts.workDir);
  }
  if (opts.sourceType === "drive") {
    if (!opts.sourceUrl) throw new Error("Drive URL missing");
    return downloadDrive(opts.sourceUrl, opts.driveRefreshToken, opts.workDir);
  }
  if (opts.sourceType === "upload") {
    if (!opts.sourceKey) throw new Error("Upload key missing");
    const dest = path.join(opts.workDir, "source.mp4");
    await downloadSourceKey(opts.appUrl, opts.sourceKey, dest);
    return dest;
  }
  throw new Error("Unknown source type");
}
