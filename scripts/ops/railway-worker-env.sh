#!/usr/bin/env bash
# Copies the worker's secrets from adx/.env into the Railway "worker" service. Run it yourself:
#   bash scripts/ops/railway-worker-env.sh
# Prints names only, never values. Railway redeploys the worker automatically afterwards.
set -euo pipefail
cd "$(dirname "$0")/../.."

NAMES=(ARKIV_ACCESS_KEY ARKIV_PLATFORM_WORKER_KEY ARKIV_VERIFIER_KEY DATABASE_URL UPLOAD_TOKEN_SECRET GEMINI_API_KEY)

get() {
  python3 - "$1" <<'EOF'
import sys
name = sys.argv[1]
for line in open(".env"):
    line = line.rstrip("\n")
    if line.startswith(name + "="):
        v = line.split("=", 1)[1].strip()
        if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
            v = v[1:-1]
        print(v, end="")
        break
EOF
}

args=()
for n in "${NAMES[@]}"; do
  v="$(get "$n")"
  if [[ -z "$v" ]]; then echo "skip  $n (not in .env)"; continue; fi
  args+=(--set "$n=$v")
  echo "set   $n"
done
railway variables --service worker --skip-deploys "${args[@]}" >/dev/null
railway redeploy --service worker -y >/dev/null 2>&1 || true
echo "done. Check: curl https://\$(railway domain --service worker 2>/dev/null | grep -o '[a-z0-9.-]*railway.app' | head -1)/health"
