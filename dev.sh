#!/bin/sh
set -eu

TEAPP_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$TEAPP_ROOT"

# Match host ownership, including PostgreSQL files, without changing host groups.
LOCAL_UID=$(id -u)
LOCAL_GID=$(id -g)
export LOCAL_UID LOCAL_GID

TEAPP_USE_SUDO=0
if [ "${1:-}" = '--sudo' ]; then
  TEAPP_USE_SUDO=1
  shift
fi

compose() {
  if [ "$TEAPP_USE_SUDO" = 1 ]; then
    # Elevate Docker only: bind directories are still prepared by the host user.
    sudo env LOCAL_UID="$LOCAL_UID" LOCAL_GID="$LOCAL_GID" \
      docker compose --env-file "$TEAPP_ROOT/backend/.env" "$@"
  else
    docker compose --env-file "$TEAPP_ROOT/backend/.env" "$@"
  fi
}

prepare() {
  if [ ! -f backend/.env ]; then
    TEAPP_PASSWORD=$(od -An -N24 -tx1 /dev/urandom | tr -d ' \n')
    (umask 077 && sed "s/replace-with-a-local-dev-password/$TEAPP_PASSWORD/" \
      backend/.env.example > backend/.env)
    printf '%s\n' 'Created backend/.env with a generated local database password.'
  fi
  if ! grep -q '^KEYCLOAK_ADMIN_PASSWORD=' backend/.env; then
    TEAPP_ADMIN_PASSWORD=$(od -An -N24 -tx1 /dev/urandom | tr -d ' \n')
    printf '\nKEYCLOAK_ADMIN_USERNAME=admin\nKEYCLOAK_ADMIN_PASSWORD=%s\n' "$TEAPP_ADMIN_PASSWORD" >> backend/.env
    printf '%s\n' 'Added Keycloak administrator credentials to backend/.env.'
  fi
  chmod 600 backend/.env
  # Compose tools such as VS Code discover a root .env automatically.
  if [ ! -e .env ] && [ ! -L .env ]; then
    ln -s backend/.env .env
  fi

  mkdir -p .local/postgres \
    .local/cache/maven .local/cache/backend-target \
    .local/cache/node_modules .local/cache/npm .local/cache/angular \
    .local/cache/alpine/node_modules .local/cache/alpine/angular \
    .local/cache/alpine/backend-target .local/cache/alpine/home \
    .local/cache/alpine/maven .local/cache/alpine/npm
  # Mount points must exist beneath the read-only source mounts. Container
  # contents live in .local/cache; these directories are only the destinations.
  mkdir -p backend/target frontend/node_modules frontend/.angular
  chmod 700 .local/postgres
}

case "${1:-up}" in
  prepare)
    prepare
    ;;
  up)
    prepare
    compose up -d --build --remove-orphans --wait --wait-timeout 1200
    compose ps
    ;;
  down)
    compose down
    ;;
  logs)
    shift
    compose logs --follow --tail 100 "$@"
    ;;
  ps)
    compose ps
    ;;
  shell)
    compose exec dev sh
    ;;
  backend)
    compose exec -w /workspace/backend dev sh ./dev.sh
    ;;
  frontend)
    compose exec -w /workspace/frontend dev sh ./dev.sh
    ;;
  clean)
    # Stop writers before discarding disposable files. Keep PostgreSQL data.
    compose down
    rm -rf -- "$TEAPP_ROOT/.local/cache"
    printf '%s\n' 'Removed dependency and build caches. Database files remain in .local/postgres/.'
    ;;
  *)
    printf '%s\n' 'Usage: ./dev.sh [--sudo] [prepare|up|down|logs [service...]|ps|shell|backend|frontend|clean]' >&2
    exit 2
    ;;
esac
