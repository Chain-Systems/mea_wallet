#!/usr/bin/env node
// Validates that all locales have the same keys and no empty values.
// Reads every translation.json under mobile/locales/<lang>/ and compares
// against the reference locale (en). Exits 1 if any issues are found.

const fs = require("fs");
const path = require("path");

const LOCALES_DIR = path.resolve(__dirname, "../../mobile/locales");
const REFERENCE = "en";

// Flatten nested object into dot-notation keys: { "a.b.c": "value" }
function flatten(obj, prefix = "") {
  return Object.entries(obj).reduce((acc, [key, val]) => {
    const full = prefix ? `${prefix}.${key}` : key;
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      Object.assign(acc, flatten(val, full));
    } else {
      acc[full] = val;
    }
    return acc;
  }, {});
}

function loadLocale(lang) {
  const file = path.join(LOCALES_DIR, lang, "translation.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const langs = fs
  .readdirSync(LOCALES_DIR)
  .filter((d) => fs.statSync(path.join(LOCALES_DIR, d)).isDirectory());

if (!langs.includes(REFERENCE)) {
  console.error(`Reference locale "${REFERENCE}" not found in ${LOCALES_DIR}`);
  process.exit(1);
}

const ref = flatten(loadLocale(REFERENCE));
const refKeys = new Set(Object.keys(ref));

let failed = false;

for (const lang of langs) {
  const data = flatten(loadLocale(lang));
  const langKeys = new Set(Object.keys(data));

  // Keys in reference missing from this locale
  const missing = [...refKeys].filter((k) => !langKeys.has(k));
  // Keys in this locale not in reference (orphaned)
  const extra = [...langKeys].filter((k) => !refKeys.has(k));
  // Keys present but empty string
  const empty = [...langKeys].filter(
    (k) => refKeys.has(k) && (data[k] === "" || data[k] === null || data[k] === undefined)
  );

  if (missing.length || extra.length || empty.length) {
    failed = true;
    console.error(`\n❌ [${lang}]`);
    if (missing.length)
      missing.forEach((k) => console.error(`  missing : ${k}`));
    if (extra.length)
      extra.forEach((k) => console.error(`  extra   : ${k}`));
    if (empty.length)
      empty.forEach((k) => console.error(`  empty   : ${k}`));
  } else {
    console.log(`✅ [${lang}] ${langKeys.size} keys — OK`);
  }
}

if (failed) {
  console.error("\ni18n check failed.");
  process.exit(1);
}

console.log("\nAll locales are in sync.");
