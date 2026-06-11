# Expo SDK Upgrade: 53 → 56

Linear, one-major-at-a-time upgrade following Expo's official flow
(`expo install expo@^NN` → `expo install --fix` → verify a local build).
Each step is its own commit and was verified with a local Android bundle
(`expo export --platform android`) before moving on.

## Version deltas

| | SDK 53 (before) | SDK 54 | SDK 55 | SDK 56 (after) |
|---|---|---|---|---|
| expo | 53.0.16 | 54.0.35 | 55.0.26 | **56.0.9** |
| react | 19.0.0 | 19.1.0 | 19.2.0 | 19.2.3 |
| react-native | 0.79.5 | 0.81.5 | 0.83.6 | 0.85.3 |
| reanimated | 3.17.x | 4.1.1 | 4.2.1 | 4.3.1 |
| react-native-worklets | — | 0.5.1 (new) | 0.7.4 | 0.8.3 |
| skia | 2.1.x | aligned | 2.4.18 | 2.6.2 |
| typescript | 5.8 | 5.9 | 5.9 | 6.0 |

Local build artifact per step: ~12–13 MB Hermes bundle, all succeeded.

## Breaking changes handled

### SDK 54 — Reanimated 3 → 4
Reanimated 4 is New-Architecture-only (app already has `newArchEnabled: true`)
and split its Babel plugin into a separate package. Added
**`react-native-worklets`**; without it Metro fails with
`Cannot find module 'react-native-worklets/plugin'`.

### SDK 56 — expo-router drops `@react-navigation` re-exports
As of SDK 56 expo-router is no longer compatible with direct
`@react-navigation/*` imports
([guide](https://docs.expo.dev/router/migrate/sdk-55-to-56/)). The three direct
imports were migrated to expo-router equivalents:

| File | Before | After |
|---|---|---|
| `app/index.tsx` | `useRoute().params` | `useLocalSearchParams()` |
| `app/(Tabs)/home.tsx` | `useNavigation()` (unused) | removed |
| `app/(Views)/settings/select-avatar.tsx` | `useNavigation()` (unused) | removed |

## Verification scope & follow-ups

Verified locally on Linux via **JS bundle** (`expo export`) — the realistic
local signal without macOS/Android SDK toolchains. Not yet verified on this
machine:

- **Native device builds** (Gradle/Xcode) — run `eas build` per platform.
- **Skia native binary**: its postinstall downloads a prebuilt from a CDN that
  was returning 504/ECONNRESET during this upgrade. Installs used
  `npm install --ignore-scripts` (fine for JS bundling). A clean
  `npm install` / EAS build will fetch it when the CDN is healthy.
- Runtime smoke test of screens that used the migrated navigation hooks.

The legacy `@react-navigation/*` packages remain as (now indirect-only)
dependencies; they can be pruned in a follow-up once confirmed unused by any
transitive path.

## Native Android build — verified ✅

A full release build was produced locally on Linux:
`expo prebuild` + `./gradlew :app:assembleRelease` →
`app-release.apk` (compileSdk/targetSdk 36 / Android 16, versionName 1.0.44).

Two repo changes were required to get there:

1. **Removed `react-native-in-app-updates`.** It was an unused duplicate
   (the app uses `sp-react-native-in-app-updates`) and its Android code
   (`InAppUpdatesModule.kt` → `currentActivity`) no longer compiles against
   RN 0.85. Expo autolinking compiles every native module in `node_modules`,
   so an unused-but-installed module still breaks the build.
2. **Removed `android.edgeToEdgeEnabled` from app.json.** Android 16 makes
   edge-to-edge mandatory; the option is gone in SDK 56 and prebuild warns on it.

### Local toolchain notes (machine setup, not repo changes)

- Android SDK packages: `platforms;android-36`, `build-tools;36.0.0`,
  `ndk;27.1.12297006`, `cmake;3.22.1`.
- RN 0.85 ships Gradle 9.3.1 but its Gradle plugin pins
  `foojay-resolver-convention` 0.5.0, which crashes on Gradle 9
  (`NoSuchFieldError: JvmVendorSpec.IBM_SEMERU`) **if** Gradle has to
  auto-download a JDK toolchain. Setting
  `org.gradle.java.installations.auto-download=false` in
  `~/.gradle/gradle.properties` makes Gradle use the local JDK and avoids it.
  EAS build images ship the correct JDK, so this does not affect EAS/CI.
