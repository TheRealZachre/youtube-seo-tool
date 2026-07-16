#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

env_file=".open-next/cloudflare/next-env.mjs"
if [ -f "$env_file" ]; then
  awk '!seen[$0]++' "$env_file" > "${env_file}.tmp" && mv "${env_file}.tmp" "$env_file"
fi

if npx wrangler deployments list 2>/dev/null | grep -q .; then
  npx opennextjs-cloudflare upload
  npx wrangler versions deploy --yes || true
  npx wrangler deploy
else
  npx wrangler deploy
fi
