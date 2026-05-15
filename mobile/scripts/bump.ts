#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';

type BumpLevel = 'patch' | 'minor' | 'major';

const level = process.argv[2] as BumpLevel;
if (!['patch', 'minor', 'major'].includes(level)) {
  console.error('Usage: tsx scripts/bump.ts <patch|minor|major>');
  process.exit(1);
}

const pkgPath = path.resolve(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const [major, minor, patch] = (pkg.version as string).split('.').map(Number);

let next: string;
if (level === 'patch') next = `${major}.${minor}.${patch + 1}`;
else if (level === 'minor') next = `${major}.${minor + 1}.0`;
else next = `${major + 1}.0.0`;

pkg.version = next;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`bumped to ${next}`);
