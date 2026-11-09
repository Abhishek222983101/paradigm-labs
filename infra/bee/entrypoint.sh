#!/bin/sh
set -e
DATA="${BEE_DATA_DIR:-/home/bee/.bee}"
mkdir -p "$DATA/keys"
if [ -n "$BEE_SWARM_KEY_JSON" ]; then
  echo "$BEE_SWARM_KEY_JSON" | base64 -d > "$DATA/keys/swarm.key"
  chmod 600 "$DATA/keys/swarm.key"
fi
exec bee start
