#!/bin/sh
set -eu

cd /workspace/frontend
LOCK_HASH=$(sha256sum package-lock.json | cut -d ' ' -f 1)
if [ ! -x node_modules/.bin/capacitor ] \
  || [ ! -f node_modules/.teapp-lock ] \
  || [ "$(cat node_modules/.teapp-lock)" != "$LOCK_HASH" ]; then
  npm ci --no-audit --no-fund
  printf '%s\n' "$LOCK_HASH" > node_modules/.teapp-lock
fi

npm run build
npx cap sync android
cd /workspace/frontend/android
sh ./gradlew --no-daemon assembleDebug

mkdir -p /workspace/artifacts
cp app/build/outputs/apk/debug/app-debug.apk /workspace/artifacts/TEApp-debug.apk
printf '%s\n' 'APK created: artifacts/TEApp-debug.apk'
