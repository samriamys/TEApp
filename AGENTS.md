# TEApp project context

## Product

TEApp is a prototype Spanish literacy learning app. It provides letter lessons, practice exercises, exams, and student or tutor profile screens. The client assembles lessons and quiz content from vocabulary data served by a backend API.

## Implemented architecture

- **Client (`frontend/`)**: Angular 18 standalone app using Ionic 8, TypeScript, and RxJS. Capacitor 6 packages the app for Android. Keep `frontend/android/` inside the client; it is the Capacitor native platform project and its Gradle files use relative paths to the client’s `node_modules`. `src/main.ts` bootstraps the app, router, and HTTP client; `src/app/app.routes.ts` lazy-loads feature pages.
- **Learning features**: Lesson, exercise, and exam pages compose reusable components. They request vocabulary, select/shuffle items, play audio, and evaluate answers in the client. Quiz results and learning progress are not sent to the backend.
- **Letter lessons**: The letter route loads `GenericLessonsComponent` directly, which reads the selected letter from route parameters. Avoid adding per-letter wrapper folders unless a letter needs genuinely unique behavior.
- **Authentication and profiles**: Keycloak provides OIDC login and registration with authorization code and PKCE. Passwords go directly to the Keycloak-hosted form; the Angular adapter holds tokens in memory. The API validates issuer, signature, expiry and `teapp-api` audience. An application-owned `app_profile` record stores each account’s selected role and tutor link; tutor codes are generated on the server. The selected role is self-declared during registration and must not be treated as a verified teaching credential. Student learning progress remains simulated.
- **Content API (`backend/`)**: Java 17 Spring Boot 4 application under package `com.teapp.api`. `TeAppApiApplication` starts the server; `PalabraController` handles vocabulary requests; `PalabraRepository` performs a native SQL query; `Palabra` maps the `palabra` table.
- **Database**: PostgreSQL 16. `compose.yaml` binds its data directory to `.local/postgres/` in this repository. The vocabulary query joins `palabra`, `recurso`, and `vocal`. Hibernate schema generation is disabled; `database/init/001-schema.sql` creates a minimal local schema on the first initialization of an empty data directory.

Content request flow:

```text
Lesson / exercise / exam page
  -> PalabraService (/api/palabras, relative to the browser origin)
  -> Angular development proxy (backend:8080 in Compose)
  -> Spring Security validates the Keycloak access token
  -> PalabraController
  -> PalabraRepository (native SQL)
  -> PostgreSQL
  -> JSON words with text, image URL, and audio URL
```

The implemented API contract is `GET /api/palabras?vocal=<letter>&dificultad=<level>`. The controller returns a list of objects with `texto`, `imagen`, and `audio` fields.

## Container development

- Compose runs a single Alpine `dev` container with JDK 17, Maven, Node and npm, alongside separate PostgreSQL and Keycloak containers. The repository is mounted read/write at `/workspace` for editing and building. PostgreSQL data remains in `.local/postgres/`.
- Run `./dev.sh --sudo up` if Docker requires sudo, or `./dev.sh up` if the current user has Docker access. The script builds the Alpine image, prepares host-owned cache directories, removes old frontend/backend containers and starts the dev and database services. It does not start the application processes.
- In separate terminals, run `./dev.sh --sudo backend` and `./dev.sh --sudo frontend` (omit `--sudo` if Docker is accessible without it). The API listens on localhost:8080 and Angular on localhost:4200. Angular recompiles on source changes; restart the backend command after Java changes. The frontend installs dependencies only when the lockfile changes.
- `./dev.sh --sudo shell` opens a shell in `/workspace`; in VS Code, `Dev Containers: Reopen in Container` attaches to the same Compose service after `./dev.sh prepare`. The service and container ports are configured in `.devcontainer/devcontainer.json`.
- `./dev.sh --sudo down` stops containers, and `./dev.sh --sudo clean` stops them and deletes `.local/cache/` while preserving database data. Deleting `.local/postgres/` permanently deletes the local database. Docker images remain managed by Docker.
- `backend/.env` contains local credentials and host-facing port settings. `dev.sh prepare` generates a local Keycloak bootstrap admin password if missing. The identity service uses a separate `keycloak` schema in the existing PostgreSQL database and listens at `http://localhost:8180`. `identity/realm/teapp-realm.json` is imported only when the realm does not yet exist; edits to the file do not update an existing realm. `identity/themes/teapp/` contains the Figma-inspired Keycloak forms. The local admin credentials are in the ignored env file. Preparation creates a Git-ignored root `.env` symlink to it for Compose tools including VS Code. Compose overrides the database host to `postgres:5432` inside the dev container. `frontend/proxy.conf.cjs` sends `/api` to the local backend. Production and native Android builds need their own API routing.
- `backend/src/main/resources/schema.sql` creates or extends the app profile table on backend startup without dropping existing data. `database/init/001-schema.sql` runs only on an empty data directory. It is a baseline inferred from the current code and contains no vocabulary or media; import actual content separately. Existing PostgreSQL data is not migrated automatically.
- `.local/cache/alpine/` stores Alpine-compatible npm modules, build artifacts and Maven caches separately from older Debian caches. All `.local/` contents are Git-ignored. The repo mount includes source files and permits writing from within the dev container.

## Known implementation gaps

- **Native Android authentication and API hosting**: The current OIDC setup targets the localhost web development server. Capacitor needs a native browser/deep-link integration, a reachable HTTPS identity endpoint and API host, and registered redirect URIs before Android sign-in can work.
- **Local identity configuration is development-only**: Keycloak runs in `start-dev` mode on localhost. Production requires an HTTPS hostname, secure secrets, an email provider and an appropriately configured realm, backup and operational practices. Registration roles are self-selected, not proof of tutor authority.
- **Progress persistence is not implemented**: tutor/student links are persisted but learning progress is still simulated. The tutor dashboard lists linked student identities; it does not yet track their course progress.
- **Architecture diagram includes older planned components**: `docs/architecture.drawio` shows `TEApi - guard`; the implemented identity provider is Keycloak instead. Treat current source as authoritative.
- **Database configuration**: Spring Boot imports `backend/.env` when launched with `backend/` as its working directory. The local env file is ignored by Git; `backend/.env.example` is the safe template. Do not copy credentials into documentation or expose them in responses. Replace local development credentials with managed secrets before deployment.

## Working preferences

- The user performs testing manually unless they explicitly request automated testing. Do not run tests, launch applications for testing, or perform interactive verification without that request. When useful, provide clear manual test steps.
- Keep development runtimes in containers and persistent container data/dependencies in ignored repo folders so they are easy to clean up. Avoid installing Java, Node, or PostgreSQL globally for this project.
