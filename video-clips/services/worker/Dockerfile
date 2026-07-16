FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    curl \
    ca-certificates \
  && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
  && chmod a+rx /usr/local/bin/yt-dlp \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Build from the video-clips monorepo root:
#   docker build -f services/worker/Dockerfile .
COPY package.json package-lock.json ./
COPY services/worker/package.json ./services/worker/
COPY shared/package.json ./shared/
RUN npm install --workspace=@video-clips/worker

COPY shared ./shared
COPY services/worker ./services/worker

WORKDIR /app/services/worker
ENV PORT=8787
EXPOSE 8787
CMD ["npx", "tsx", "src/index.ts"]
