#!/usr/bin/env bash
# Deploy OpenNext build to Cloudflare Workers and sync custom domains.
set -euo pipefail
cd "$(dirname "$0")/.."

env_file=".open-next/cloudflare/next-env.mjs"
if [ -f "$env_file" ]; then
  awk '!seen[$0]++' "$env_file" > "${env_file}.tmp" && mv "${env_file}.tmp" "$env_file"
fi

upload_log="$(mktemp)"
trap 'rm -f "$upload_log"' EXIT

set +e
npx opennextjs-cloudflare upload 2>&1 | tee "$upload_log"
upload_status=${PIPESTATUS[0]}
set -e

if [ "$upload_status" -ne 0 ]; then
  if grep -q "does not yet exist" "$upload_log"; then
    echo "Worker not created yet — running full wrangler deploy..."
    npx wrangler deploy
    exit 0
  fi
  echo "ERROR: opennextjs-cloudflare upload failed with exit code ${upload_status}." >&2
  exit "$upload_status"
fi

version_id="$(
  awk -F': ' '/Worker Version ID:/{print $2}' "$upload_log" | tail -1 | tr -d '[:space:]'
)"

if [ -z "${version_id:-}" ]; then
  version_id="$(
    npx wrangler versions list 2>/dev/null | awk -F': ' '/Version ID:/{print $2}' | head -1 | tr -d '[:space:]'
  )"
fi

if [ -n "${version_id:-}" ]; then
  echo "Promoting version ${version_id} to 100% traffic..."
  npx wrangler versions deploy "${version_id}" --yes
else
  echo "WARNING: Could not determine uploaded Worker version ID; skipping traffic promotion." >&2
fi

echo "Syncing routes and custom domains..."
npx wrangler deploy 2>&1 | grep -E "domain|route|Deployed|Uploaded|https://" || true
