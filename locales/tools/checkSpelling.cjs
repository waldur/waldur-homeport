#!/usr/bin/env node

/**
 * Fails when a source string uses British spelling. Source strings are US
 * English; the British variant is generated into locales/en-GB.json from
 * them, so a British source string would show British spelling to US users
 * and never reach en-GB.json.
 *
 * Strings that only come from files generated from the backend
 * (SettingsDescription.ts, FeaturesDescription.ts, the enum files) are
 * skipped: they are fixed in the backend and regenerated.
 */

const fs = require('fs');
const path = require('path');

const { findBritishForm } = require('./britishSpelling.cjs');

const rootDir = path.join(__dirname, '../..');
const template = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'template.json'), 'utf8'),
);

const listSourceFiles = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === 'node_modules' ? [] : listSourceFiles(fullPath);
    }
    return /\.tsx?$/.test(entry.name) ? [fullPath] : [];
  });

const packagesDir = path.join(rootDir, 'packages');
const sourceDirs = [
  path.join(rootDir, 'src'),
  ...fs
    .readdirSync(packagesDir)
    .map((name) => path.join(packagesDir, name, 'src'))
    .filter((dir) => fs.existsSync(dir)),
];

const isGenerated = (content) =>
  /auto-generated/.test(content.split('\n', 3).join('\n'));

const handWritten = sourceDirs
  .flatMap(listSourceFiles)
  .map((file) => ({ file, content: fs.readFileSync(file, 'utf8') }))
  .filter(({ content }) => !isGenerated(content));

// A string appears in the source as written, or with its quotes escaped.
const spellings = (key) => [key, key.replace(/'/g, "\\'")];

const problems = [];
for (const key of Object.keys(template)) {
  const form = findBritishForm(key);
  if (!form) continue;
  const files = handWritten
    .filter(({ content }) => spellings(key).some((s) => content.includes(s)))
    .map(({ file }) => path.relative(rootDir, file));
  if (files.length) {
    problems.push({ key, form, files });
  }
}

if (problems.length) {
  console.error(
    `${problems.length} source string(s) use British spelling. Write source strings in US English; locales/en-GB.json is generated from them.\n`,
  );
  for (const { key, form, files } of problems) {
    console.error(`  "${form}" in "${key}"\n    ${files.join('\n    ')}`);
  }
  process.exit(1);
}
console.log('Source strings use US spelling.');
