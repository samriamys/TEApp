#!/bin/sh
set -eu

# The backend runs inside the Compose dev container and reaches Keycloak over
# the Compose network; tokens still carry the browser-facing localhost issuer.
export OIDC_JWK_SET_URI="${OIDC_JWK_SET_URI:-http://keycloak:8080/realms/teapp/protocol/openid-connect/certs}"

# Empty the build output without removing the bind mount itself.
# This also prevents stale classes after a Java package or file is renamed.
find target -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +

exec mvn --batch-mode --no-transfer-progress \
  -Dmaven.repo.local=/cache/maven/repository \
  spring-boot:run
