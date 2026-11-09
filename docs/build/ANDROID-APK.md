# Android APK (Trusted Web Activity)

Paradigm also installs as an Android app. It is a **Trusted Web Activity**, not a native app: the APK opens https://adx-paradigm.vercel.app/tasks in full Chrome, so passkeys, the camera, World ID and the World App hand-off behave exactly as on the web. A plain WebView would break passkeys and the World App return, so we didn't use one.

- Built with Google's Bubblewrap CLI (`@bubblewrap/cli`), outside this repo (`~/paradigm-android`).
- Package `app.paradigm.adx`, version 1.0.0, minSdk 24, targetSdk 36, portrait, theme `#09090b`, start `/tasks`.
- Icons rendered from `apps/web/src/app/icon.svg` (512 px, plus a padded maskable version).
- The signing keystore and its password never enter the repo.

## Digital Asset Links
`apps/web/public/.well-known/assetlinks.json` ties the domain to the APK's signing key (SHA-256 `10:4B:30:EE:…:EB:B7`). With it, Chrome hides the URL bar and the app runs full screen. It is a static file only; no app code changed.

## Build steps (for reruns)
1. `npm i -g @bubblewrap/cli`; JDK 17 + Android SDK in `~/.bubblewrap` (`bubblewrap doctor` must pass).
2. Edit `twa-manifest.json`, then `bubblewrap update --skipVersionUpgrade` (serve the icons folder on 127.0.0.1:8766 first).
3. `bubblewrap build` → `app-release-signed.apk`.
4. `bubblewrap fingerprint generateAssetLinks` → copy into `apps/web/public/.well-known/`.

## Install
`adb install app-release-signed.apk`, or copy the APK to the phone and tap it.
