# Offline mode

TEApp can create local tutor and student accounts without contacting the Java server or Keycloak. The existing online account flow remains available separately; local accounts are not linked or synchronized with online accounts.

The on-device service is in `frontend/src/app/local-api/`. It mirrors the server's vocabulary and profile operations using SQLite. Android stores the database in the application's private storage through the Capacitor SQLite plugin. In the browser development build, SQLite runs in WebAssembly and its database is persisted in IndexedDB. Passwords are stored as salted PBKDF2 hashes. The active local session uses Android secure storage; web development uses browser storage.

The browser's `sql.js` dependency is pinned to 1.11.0 to match the JavaScript runtime embedded in `jeep-sqlite` 2.8.0. Keep its WebAssembly file and that embedded runtime in sync when upgrading either package.

A local tutor gets a code on registration. A local student must enter the code of a tutor registered in the same device or browser database. The tutor profile lists linked local students. Local lesson, exercise, and exam sessions record start and finish times, elapsed duration, current/total activity progress, attempts, correct answers, and exam score. Exercise and exam answers also record the word, selected and correct letters, correctness, question position, response time, and timestamp. Abandoned activities retain their partial session and answers. Each exam builds and shuffles a fresh question set for the attempt. The student profile shows completed vowels and the next uncompleted vowel; a full personalized curriculum is not implemented. Data is saved only on this installation and is not synchronized to the server.

The app includes a small demonstration pack for the five vowels in `frontend/src/assets/local-content/`: vocabulary records, simple visual prompts, and synthesized Spanish audio. It is intended for development and must be replaced or reviewed for the real curriculum. The pack uses negative word IDs reserved for bundled demonstration content; app updates can replace the pack by increasing its version. Existing local user records and learning events are stored separately. `frontend/tools/generate-offline-demo.py` documents how the demonstration files were generated using eSpeak NG; it is not needed to build the app.

Words can omit either `imagen` or `audio` in the bundled pack, or have null media URLs in SQLite. Missing or broken images show a placeholder without revealing the answer; missing or unplayable audio falls back to the device's Spanish speech synthesis when available. A device may need a Spanish voice installed for speech to work offline; activities remain usable without audio.

Local data belongs to the installation. Clearing site data, clearing Android app data, or uninstalling the app can remove local accounts and progress. Backup, account recovery, synchronization, and cross-device tutor links are not implemented.

## Development accounts

The Angular development build creates two local accounts when it first opens the local database, including for an existing database. They are linked, so the professor's profile lists the student. Select the corresponding role and use **Inicia aquí** under local sign-in:

| Role | Email | Password |
| --- | --- | --- |
| Profesor | `profesor@teapp.test` | `Teapp1234` |
| Alumno | `alumno@teapp.test` | `Teapp1234` |

The professor's code is `TEAPP-DEMO`. Seeding does not overwrite accounts or progress. Production builds do not create these accounts, although accounts already created in a shared local database remain there until its data is cleared. These are public demonstration credentials, not online accounts.

## Manual checks

1. Start the web development frontend, choose **Profesor**, and select **Crear cuenta local**. Register a tutor and copy the code from the tutor profile.
2. Sign out. Choose **Alumno**, register a local student using that code, then sign out and sign in as the tutor. The student should appear in the tutor's list.
3. Sign back in as the student. Advance partway through a vowel lesson, then leave and reopen it. Complete a lesson, exercise, and exam; local SQLite records the sessions, answers, timing, progress, and scores. Return to the profile and check completed vowels. Reopen the same exam twice and confirm the question order changes.
4. Reload and sign back in if needed. Confirm that the local account and completed lesson remain. The browser database is separate from the tablet's database.
5. On an Android tablet, install a newly built APK, complete the same steps, then disconnect the tablet from the network and open a lesson. The bundled content and existing local accounts should remain available. Online login and accounts require the existing services.
