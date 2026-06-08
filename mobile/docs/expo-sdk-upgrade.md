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
