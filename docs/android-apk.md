# Local Android APK

Build an installable debug APK for the current local stack with:

```sh
./dev.sh apk
```

The command builds a separate Debian Android SDK container, builds the Angular app, syncs Capacitor, and writes `artifacts/TEApp-debug.apk`. It keeps Android SDK, npm, and Gradle caches in the ignored `.local/cache/android/` folder.

Start the services with `./dev.sh up`, then run `./dev.sh backend` and `./dev.sh frontend` in separate terminals. With an Android emulator running on the same computer, install the APK with:

```sh
adb install -r artifacts/TEApp-debug.apk
```

The app uses Keycloak in the system browser for sign-in and registration, then returns to TEApp through its registered `com.teapp.app://` URL scheme. Its backend and Keycloak addresses default to `10.0.2.2`, Android Emulator's host alias for `localhost`.

For a physical Android phone on the same network, set `HOST_BIND_ADDRESS=0.0.0.0` in `backend/.env`, add the computer's LAN issuer to `OIDC_ALLOWED_ISSUERS`, and allow ports 8080 and 8180 through the computer's firewall. Change `nativeApiBaseUrl` and `nativeKeycloakUrl` in `frontend/src/environments/environment.prod.ts` to use that LAN address, then run `./dev.sh up` and `./dev.sh apk` again. The backend validates both allowed Keycloak issuers while fetching signing keys over the private Compose network.

This APK is for the local development stack. It uses HTTP for the app-to-service and token-exchange requests and permits cleartext networking in the Android debug manifest. A public release needs HTTPS service addresses and a release signing key; it should not use the local emulator defaults.
