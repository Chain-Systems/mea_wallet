# Bun Migration

This project uses **Bun as the package manager** and **Bun as the runtime for
local TypeScript dev scripts**. The Expo/Metro build tooling continues to run on
**Node** (see Limitations).

## What changed

| Area | Before | After |
|---|---|---|
| Package manager | npm / pnpm (two lockfiles) | Bun (`bun.lock`) |
| Lockfiles | `package-lock.json`, `pnpm-lock.yaml` | `bun.lock` only |
| Native build scripts | pnpm `onlyBuiltDependencies[]` in `.npmrc` | `trustedDependencies` in `package.json` |
| Dev TS scripts | `npx tsx ./scripts/bump.ts` | `bun ./scripts/bump.ts` |

## Commands

```bash
bun install                 # install deps (replaces npm/pnpm install)
bun add <pkg>               # add a dependency
bun remove <pkg>            # remove a dependency
bun run android             # expo start --android (Metro runs on Node)
bun run bump:patch          # version bump script, executed by Bun runtime
```

## trustedDependencies

Bun blocks postinstall scripts by default. Packages that need to run native
build steps are allow-listed in `package.json → trustedDependencies`:

- `@firebase/util`
- `@shopify/react-native-skia`
- `bufferutil`
- `protobufjs`
- `unrs-resolver`
- `utf-8-validate`

This replaces the pnpm `onlyBuiltDependencies[]` entries that previously lived
in `.npmrc`.

## Verified locally

- `bun install` → 1448 packages, `bun.lock` generated, skia native build ran
- `npx expo export --platform android` (Node) → Metro resolves Bun's
  `node_modules`; 12.4 MB Hermes bundle produced, no resolution errors

## Limitations (why Metro stays on Node)

Running the Expo CLI under the Bun runtime (`bun --bun expo export`) **bundles
successfully** (5405 modules) but the export process **hangs at finalization and
never exits** — a known incompatibility between Bun's process/worker handling and
Metro. Forcing `--bun` in build scripts would hang CI, so:

- `start`, `android`, `ios`, `web`, `lint` scripts run the Expo CLI on **Node**
  (Bun only resolves the binary; it does not execute Metro).
- Only the standalone TS scripts (`bump`) use the Bun runtime, where it works.

The React Native app itself runs on **Hermes** on-device — Bun is never a device
runtime, so there is no "Bun runtime" change at the app level.

## EAS

EAS Build auto-detects the package manager from the lockfile. With only
`bun.lock` present, EAS uses `bun install`. No workflow change required.
