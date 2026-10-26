#!/usr/bin/env node
// Rewrites unknown-classes.baseline.json: for each file, the classes
// waldur-custom/no-unknown-class reports there today. Run it after fixing
// listed classes (the rule reports a listed class the file no longer has as
// stale); never to make a new unknown class pass.
//
//   yarn lint:classes:baseline
//
// Lints the same paths as `yarn lint:check`, with only that rule and with the
// current baseline ignored, so the result is the full set of unknown classes.

import console from 'node:console';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

process.env.WALDUR_UNKNOWN_CLASS_BASELINE = 'ignore';

const { ESLint } = await import('eslint');

const root = path.resolve(fileURLToPath(import.meta.url), '../..');
const RULE = 'waldur-custom/no-unknown-class';
const LINTED = ['src', 'locales/tools', 'packages'];

const eslint = new ESLint({
  cwd: root,
  ruleFilter: ({ ruleId }) => ruleId === RULE,
});
const results = await eslint.lintFiles(LINTED);

const baseline = {};
for (const result of results) {
  const tokens = new Set();
  for (const message of result.messages) {
    if (message.ruleId !== RULE) continue;
    if (message.fatal)
      throw new Error(`${result.filePath}: ${message.message}`);
    tokens.add(message.message.match(/^"([^"]+)"/)[1]);
  }
  if (tokens.size) {
    const file = path.relative(root, result.filePath).split(path.sep).join('/');
    baseline[file] = [...tokens].sort();
  }
}

const sorted = Object.fromEntries(
  Object.entries(baseline).sort(([a], [b]) => a.localeCompare(b)),
);
// Formatted as prettier (which lint-staged runs) would, so a rewrite only
// shows real changes.
const prettier = await import('prettier');
const target = path.join(root, 'unknown-classes.baseline.json');
writeFileSync(
  target,
  await prettier.format(JSON.stringify(sorted), {
    ...(await prettier.resolveConfig(target)),
    filepath: target,
  }),
);
const count = Object.values(sorted).reduce((n, t) => n + t.length, 0);
console.log(
  `unknown-classes.baseline.json: ${count} classes in ${Object.keys(sorted).length} files`,
);
