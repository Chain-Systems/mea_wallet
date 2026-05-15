#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';

type BumpLevel = 'patch' | 'minor' | 'major';

const args = process.argv.slice(2);
let level: BumpLevel;

const levelFlagIdx = args.indexOf('--level');
if (levelFlagIdx !== -1) {
  level = args[levelFlagIdx + 1] as BumpLevel;
} else {
  level = args[0] as BumpLevel;
}

if (!['patch', 'minor', 'major'].includes(level)) {
  console.error('Usage: tsx scripts/bump.ts [patch|minor|major] [--level patch|minor|major]');
  process.exit(1);
}

const root = path.resolve(__dirname, '..');
const pkgPath = path.join(root, 'package.json');
const appPath = path.join(root, 'app.json');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const [major, minor, patch] = (pkg.version as string).split('.').map(Number);

let next: string;
if (level === 'patch') next = `${major}.${minor}.${patch + 1}`;
else if (level === 'minor') next = `${major}.${minor + 1}.0`;
else next = `${major + 1}.0.0`;

pkg.version = next;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

const app = JSON.parse(fs.readFileSync(appPath, 'utf8'));
app.expo.version = next;
fs.writeFileSync(appPath, JSON.stringify(app, null, 2) + '\n');

console.log(`bumped to ${next}`);
