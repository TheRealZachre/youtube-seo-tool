#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [ "${OPENNEXT_INNER_BUILD:-}" = "1" ]; then
  exec next build
fi

export OPENNEXT_INNER_BUILD=1
env OPENNEXT_CLOUDFLARE=1 npx opennextjs-cloudflare build

env_file=".open-next/cloudflare/next-env.mjs"
if [ -f "$env_file" ]; then
  awk '!seen[$0]++' "$env_file" > "${env_file}.tmp" && mv "${env_file}.tmp" "$env_file"
fi
