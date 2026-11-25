#!/bin/sh
set -eu

# Install only when the lockfile changes, or dependencies have been removed.
LOCK_HASH=$(sha256sum package-lock.json | cut -d ' ' -f 1)
if [ ! -x node_modules/.bin/ng ] || [ ! -f node_modules/.teapp-lock ] || [ "$(cat node_modules/.teapp-lock)" != "$LOCK_HASH" ]; then
  npm ci --no-audit --no-fund
  printf '%s\n' "$LOCK_HASH" > node_modules/.teapp-lock
fi
exec npm start -- --poll=1000
