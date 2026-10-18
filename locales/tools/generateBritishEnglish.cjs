#!/usr/bin/env node

/**
 * Writes locales/en-GB.json: the British spelling of every source string in
 * template.json that differs from its US spelling. Strings that are the same
 * in both variants are left out, so translate() falls back to the source.
 *
 * The file is generated, not edited: change the rules in britishSpelling.cjs
 * and re-run `yarn i18n:en-gb`. CI regenerates it and fails on a diff.
 */

const fs = require('fs');
const path = require('path');

const { toBritish } = require('./britishSpelling.cjs');

const rootDir = path.join(__dirname, '../..');
const templateFile = path.join(rootDir, 'template.json');
const outputFile = path.join(rootDir, 'locales/en-GB.json');

const template = JSON.parse(fs.readFileSync(templateFile, 'utf8'));

const british = {};
for (const key of Object.keys(template).sort()) {
  const converted = toBritish(key);
  if (converted !== key) {
    british[key] = converted;
  }
}

fs.writeFileSync(outputFile, JSON.stringify(british, null, 2) + '\n');
console.log(
  `Wrote ${Object.keys(british).length} British English strings to locales/en-GB.json`,
);
