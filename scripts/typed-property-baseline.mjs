#!/usr/bin/env node
// Rewrites typed-property.baseline.json: for each file, how many PropertyItem
// rows of each kind waldur-custom/prefer-typed-property reports there today.
// Run it after moving rows onto typed properties (the rule reports a count
// the file no longer reaches as stale); never to make a new row pass.
//
//   yarn lint:properties:baseline
//
// Lints the same paths as `yarn lint:check`, with only that rule and with the
// current baseline ignored, so the result is every hand-formatted row.

import console from 'node:console';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

process.env.WALDUR_TYPED_PROPERTY_BASELINE = 'ignore';

const { ESLint } = await import('eslint');

const root = path.resolve(fileURLToPath(import.meta.url), '../..');
const RULE = 'waldur-custom/prefer-typed-property';
const LINTED = ['src', 'locales/tools', 'packages'];

const eslint = new ESLint({
  cwd: root,
  ruleFilter: ({ ruleId }) => ruleId === RULE,
});
const results = await eslint.lintFiles(LINTED);

// The kind is the replacement the message names; `renderFieldOrDash` rows
// carry no replacement component.
const kindOf = (message) =>
  message.match(/use <([^>]+)> from/)?.[1] ?? 'value={x}';

const baseline = {};
let total = 0;
for (const result of results) {
  const counts = {};
  for (const message of result.messages) {
    if (message.ruleId !== RULE) continue;
    if (message.fatal)
      throw new Error(`${result.filePath}: ${message.message}`);
    const kind = kindOf(message.message);
    counts[kind] = (counts[kind] ?? 0) + 1;
    total += 1;
  }
  if (Object.keys(counts).length) {
    const file = path.relative(root, result.filePath).split(path.sep).join('/');
    baseline[file] = Object.fromEntries(
      Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)),
    );
  }
}

const sorted = Object.fromEntries(
  Object.entries(baseline).sort(([a], [b]) => a.localeCompare(b)),
);
// Formatted as prettier (which lint-staged runs) would, so a rewrite only
// shows real changes.
const prettier = await import('prettier');
const target = path.join(root, 'typed-property.baseline.json');
writeFileSync(
  target,
  await prettier.format(JSON.stringify(sorted), {
    ...(await prettier.resolveConfig(target)),
    filepath: target,
  }),
);
console.log(
  `typed-property.baseline.json: ${total} row(s) in ${Object.keys(sorted).length} file(s).`,
);
