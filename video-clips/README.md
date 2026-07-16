# Vibe.Code.Flow. Video Clips

OpusClip-style AI video clipping: paste a YouTube URL, Google Drive link, or upload a file → get ranked vertical captioned clips ready to download.

## Monorepo

| Package | Purpose |
| --- | --- |
| `apps/web` | Next.js 16 app (Cloudflare via OpenNext) |
| `services/worker` | Fly.io clip worker (`yt-dlp`, Whisper, GPT, ffmpeg) |
| `shared` | Shared TypeScript types |

## Quick start

```bash
npm install
cp apps/web/.env.example apps/web/.env.local
cp services/worker/.env.example services/worker/.env

# Terminal 1 — web (port 3010)
npm run dev

# Terminal 2 — worker (port 8787)
npm run dev:worker
```

Open [http://localhost:3010](http://localhost:3010). First visit `/login` and create an admin via:

```bash
curl -X POST http://localhost:3010/api/admin/setup \
  -H 'content-type: application/json' \
  -d '{"name":"Admin","email":"you@example.com","password":"changeme123"}'
```

## Environment

See `apps/web/.env.example` and `services/worker/.env.example`.

| Variable | Required | Description |
| --- | --- | --- |
| `AUTH_SECRET` | Yes (prod) | JWT signing secret |
| `OPENAI_API_KEY` | For real clips | Whisper + GPT scoring |
| `WORKER_URL` | Local/dev | Clip worker base URL |
| `WORKER_WEBHOOK_SECRET` | Yes | Shared secret web ↔ worker |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Drive | OAuth for Drive files |

Local mode stores jobs/users in JSON under `apps/web/data/` and media under `apps/web/data/media/`. Production uses Cloudflare D1 + R2.

## Pipeline

1. Ingest (YouTube / Drive / upload) → R2 or local media
2. Transcribe with Whisper (word timestamps)
3. GPT-4o picks highlight windows + virality scores (0–99)
4. ffmpeg cuts, center-crops to 9:16, burns captions
5. Results ranked on the project page for preview + download

## YouTube notes

Datacenter IPs often hit YouTube bot checks. For production, export browser cookies to Netscape format and set `YT_DLP_COOKIES` on the worker. Upload and Drive paths do not need this.

## Deploy

```bash
# Web → Cloudflare
npm run deploy

# Worker → Fly.io
cd services/worker && fly deploy
```

Target domain: `videoclips.vibecodeflow.com`
