# Vibe.Code.Flow. YouTube SEO

Working Connect → Score → Generate → Track product UI for YouTube SEO, branded as **Vibe.Code.Flow.** and defaulting to the real [BeOne Medicines](https://www.youtube.com/@BeOneMedicines) channel.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3005](http://localhost:3005).

## Environment

| Variable | Required | Description |
| --- | --- | --- |
| `YOUTUBE_CHANNEL` | No | Defaults to `@BeOneMedicines` |
| `YOUTUBE_API_KEY` | No | YouTube Data API v3 key. When set, the app fetches live channel + recent videos. When missing or failing, it falls back to the BeOne seed library (~12 videos). |

## Product routes

| Route | Purpose |
| --- | --- |
| `/` | Marketing hero + Connect / Score / Generate / Track |
| `/channel` | Channel library ranked by SEO upside |
| `/video/[id]` | Video SEO score + recommended package |
| `/packages` | Generated package workspace |
| `/visibility` | Impressions, CTR, view velocity, share of voice |

## Scoring weights

- Title **25%**
- Description **20%**
- Tags **15%**
- Thumbnail **15%** + Retention **15%** + Engagement **10%** (40% combined)

Packages are generated with deterministic templates (no API key required). Optional LLM enhancement keys are reserved in `.env.example` for a later pass.

## Deploy

- GitHub: [TheRealZachre/youtube-seo-tool](https://github.com/TheRealZachre/youtube-seo-tool)
- Live: [https://youtubeseo.vibecodeflow.com](https://youtubeseo.vibecodeflow.com)

```bash
npm run deploy
```

## Notes

- No auth wall in v1 — open demo like the SignalComms brief reference.
- Visual system: navy / sky / gold with Vibe.Code.Flow. wordmark and contact.
