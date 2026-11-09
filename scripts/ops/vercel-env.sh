#!/usr/bin/env bash
# Copies the web app's server-side env vars from adx/.env into the Vercel project (production + preview).
# Run it yourself from the repo root:  bash scripts/ops/vercel-env.sh
# Prints names only, never values. Re-running is safe (existing values are replaced).
set -euo pipefail
cd "$(dirname "$0")/../.."
cd apps/web

NAMES=(
  ARKIV_ACCESS_KEY ARKIV_NS ARKIV_PLATFORM_WEB_KEY ARKIV_VERIFIER_KEY
  DATABASE_URL UPLOAD_TOKEN_SECRET
  WORLD_APP_ID WORLD_RP_ID WORLD_SIGNING_KEY WORLD_ACTION WORLD_ENV
  WORLD_AGENTPASS_ISSUER WORLD_AGENTPASS_CLIENT_ID WORLD_AGENTPASS_CLIENT_SECRET WORLD_AGENTPASS_REDIRECT_URI
  HEDERA_NETWORK HEDERA_OPERATOR_ID HEDERA_OPERATOR_KEY HEDERA_USDC_TOKEN_ID HEDERA_MERCHANT_ID
  WORKER_PUBLIC_URL
)

get() { # read NAME from ../../.env without sourcing it (values may contain & etc.)
  python3 - "$1" <<'EOF'
import sys
name = sys.argv[1]
for line in open("../../.env"):
    line = line.rstrip("\n")
    if line.startswith(name + "="):
        v = line.split("=", 1)[1].strip()
        if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
            v = v[1:-1]
        print(v, end="")
        break
EOF
}

for n in "${NAMES[@]}"; do
  v="$(get "$n")"
  if [[ -z "$v" ]]; then echo "skip  $n (not in .env)"; continue; fi
  for target in production preview; do
    vercel env rm "$n" "$target" -y >/dev/null 2>&1 || true
    printf '%s' "$v" | vercel env add "$n" "$target" >/dev/null 2>&1 && echo "set   $n ($target)" || echo "FAIL  $n ($target)"
  done
done
echo "done. Redeploy: git push, or 'vercel --prod' from apps/web"
