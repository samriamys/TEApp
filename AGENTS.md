# TEApp project context

## Product

TEApp is a prototype Spanish literacy learning app. It provides letter lessons, practice exercises, exams, and student or tutor profile screens. It supports local accounts and content on a tablet, while retaining a backend for online accounts and future synchronization.

The intended target is a tablet. The model and screen dimensions are not yet known. Responsive layouts are a priority: use dynamic widths that adapt to available space, and support different tablet sizes and orientations without assuming a specific device or relying on static widths for the overall layout.

## Implemented architecture

- **Client (`frontend/`)**: Angular 18 standalone app using Ionic 8, TypeScript, and RxJS. Capacitor 6 packages the app for Android. Keep `frontend/android/` inside the client; it is the Capacitor native platform project and its Gradle files use relative paths to the client’s `node_modules`. `src/main.ts` bootstraps the app, router, and HTTP client; `src/app/app.routes.ts` lazy-loads feature pages.
- **Learning features**: Lesson, exercise, and exam pages compose reusable components. They request vocabulary, select/shuffle items, play audio, and evaluate answers in the client. For local students, activity sessions, partial position, timing, answer attempts, correctness, and exam scores are stored in device SQLite. Results are not yet sent to the backend; personalized learning logic is limited to showing the next uncompleted vowel on the student profile.
- **Letter lessons**: The vowel route and general letter route load `GenericLessonsComponent` directly, which reads the selected letter from route parameters. Shared activity models, content selection, progress recording, status, and completion UI live in `frontend/src/app/learning/`. Avoid adding per-letter wrapper folders unless a letter needs genuinely unique behavior. The bundled demonstration pack currently contains vowel content only; consonant routes show an empty state until content is added.
- **Activity maps**: Lessons, exercises, and exams share `frontend/src/app/learning/activity-map.page.*`; each map reads its own local completion events. The exercise and exam maps are at `/exercise` and `/exam`, with selected activities at `/exercise/:letra` and `/exam/:letra`.
- **Authentication and profiles**: Local accounts use SQLite, salted PBKDF2 password hashes, and tutor codes generated on the same device. A local student must link to an existing local tutor; local and online accounts are separate. The local session identifier uses secure storage on Android and browser local storage in web development. Online accounts still use Keycloak OIDC with authorization code and PKCE. Browser sign-in uses `keycloak-js`; Android uses the system browser and returns through `com.teapp.app://oauth`. The API validates token signature, expiry, audience, and configured issuers. Roles are self-declared, not verified teaching credentials.
- **Local service (`frontend/src/app/local-api/`)**: `LocalApiService` and `LocalDatabaseService` mirror the app-owned profile and vocabulary contracts in SQLite, with separate local learning events. Android uses the Capacitor SQLite plugin; web development uses SQLite WASM backed by IndexedDB. A versioned, bundled demonstration pack supplies vowel lessons, images and synthesized audio. It is sample content, not the final curriculum. Negative word IDs are reserved for this pack. Synchronization with the server is not implemented.
- **Content API (`backend/`)**: Java 17 Spring Boot 4 application under package `com.teapp.api`. `TeAppApiApplication` starts the server; `PalabraController` handles vocabulary requests; `PalabraRepository` performs a native SQL query; `Palabra` maps the `palabra` table.
- **Database**: PostgreSQL 16. `compose.yaml` binds its data directory to `.local/postgres/` in this repository. `palabra` stores each word's vocal, difficulty, and media URLs, with an index on `(vocal, dificultad)`. Hibernate schema generation is disabled; `database/init/001-schema.sql` creates a minimal local schema on the first initialization of an empty data directory.

Local content request flow:

```text
Lesson / exercise / exam page
  -> PalabraService -> LocalApiService -> SQLite -> bundled media assets
```

Online content request flow:

```text
Lesson / exercise / exam page
  -> PalabraService (/api/palabras, relative to the browser origin)
  -> Angular development proxy (browser) or Android API base URL
  -> Spring Security validates the Keycloak access token
  -> PalabraController
  -> PalabraRepository (native SQL)
  -> PostgreSQL
  -> JSON words with text, image URL, and audio URL
```

The implemented API contract is `GET /api/palabras?vocal=<letter>&dificultad=<level>`. The controller returns a list of objects with `texto`, `imagen`, and `audio` fields; media fields can be null. Missing or broken images use a placeholder and missing audio falls back to device speech when available.

## Container development

- Compose runs a single Alpine `dev` container with JDK 17, Maven, Node and npm, alongside separate PostgreSQL and Keycloak containers. The repository is mounted read/write at `/workspace` for editing and building. PostgreSQL data remains in `.local/postgres/`.
- Run `./dev.sh --sudo up` if Docker requires sudo, or `./dev.sh up` if the current user has Docker access. The script builds the Alpine image, prepares host-owned cache directories, removes old frontend/backend containers and starts the dev and database services. It does not start the application processes.
- In separate terminals, run `./dev.sh --sudo backend` and `./dev.sh --sudo frontend` (omit `--sudo` if Docker is accessible without it). The API listens on localhost:8080 and Angular on localhost:4200. Angular recompiles on source changes; restart the backend command after Java changes. The frontend installs dependencies only when the lockfile changes.
- `./dev.sh apk` builds a local Android debug APK in a separate Debian Android SDK container. It writes `artifacts/TEApp-debug.apk` and caches Android dependencies in `.local/cache/android/`. The APK defaults to the Android emulator host alias; physical-device setup and the local HTTP limitation are documented in `docs/android-apk.md`.
- `./dev.sh --sudo shell` opens a shell in `/workspace`; in VS Code, `Dev Containers: Reopen in Container` attaches to the same Compose service after `./dev.sh prepare`. The service and container ports are configured in `.devcontainer/devcontainer.json`.
- `./dev.sh --sudo down` stops containers, and `./dev.sh --sudo clean` stops them and deletes `.local/cache/` while preserving database data. Deleting `.local/postgres/` permanently deletes the local database. Docker images remain managed by Docker.
- `backend/.env` contains local credentials and host-facing port settings. `dev.sh prepare` generates a local Keycloak bootstrap admin password if missing. The identity service uses a separate `keycloak` schema in the existing PostgreSQL database and listens at `http://localhost:8180`. `identity/realm/teapp-realm.json` is imported only when the realm does not yet exist; edits to the file do not update an existing realm. `identity/themes/teapp/` contains the Figma-inspired Keycloak forms. The local admin credentials are in the ignored env file. Preparation creates a Git-ignored root `.env` symlink to it for Compose tools including VS Code. Compose overrides the database host to `postgres:5432` inside the dev container. `frontend/proxy.conf.cjs` sends `/api` to the local backend. Production and native Android builds need their own API routing.
- `backend/src/main/resources/schema.sql` creates or extends the app profile table on backend startup without dropping existing data. `database/init/001-schema.sql` runs only on an empty data directory and contains no vocabulary or media; import actual content separately. Existing databases require explicit migrations, including `database/migrations/002-merge-word-resources.sql` for the original content schema.
- `.local/cache/alpine/` stores Alpine-compatible npm modules, build artifacts and Maven caches separately from older Debian caches. All `.local/` contents are Git-ignored. The repo mount includes source files and permits writing from within the dev container.

## Known implementation gaps

- **Android APK is local development only**: The debug APK uses HTTP service addresses and has cleartext networking enabled in its debug manifest. Public distribution needs HTTPS identity/API hosts and a separately managed signing key. The APK is built but not installed or manually exercised by Codex.
- **Local identity configuration is development-only**: Keycloak runs in `start-dev` mode on localhost. Production requires an HTTPS hostname, secure secrets, an email provider and an appropriately configured realm, backup and operational practices. Registration roles are self-selected, not proof of tutor authority.
- **Synchronization and personalization**: local accounts, progress, and event records are not synchronized with the server or other devices. Local profiles show actual completed vowels and the next uncompleted vowel; a full personalized curriculum is not implemented. Online progress is not persisted, and the tutor dashboard does not yet track student progress.
- **Architecture diagram includes older planned components**: `docs/architecture.drawio` shows `TEApi - guard`; the implemented identity provider is Keycloak instead. Treat current source as authoritative.
- **Database configuration**: Spring Boot imports `backend/.env` when launched with `backend/` as its working directory. The local env file is ignored by Git; `backend/.env.example` is the safe template. Do not copy credentials into documentation or expose them in responses. Replace local development credentials with managed secrets before deployment.

## Working preferences

- The user performs testing manually unless they explicitly request automated testing. Do not run tests, launch applications for testing, or perform interactive verification without that request. When useful, provide clear manual test steps.
- Keep development runtimes in containers and persistent container data/dependencies in ignored repo folders so they are easy to clean up. Avoid installing Java, Node, or PostgreSQL globally for this project.
