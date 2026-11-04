// Rewrites the per-file baseline of a rule that reads one through
// packages/eslint-plugin-waldur/lib/baseline.js. Lints the same paths as
// `yarn lint:check` with only that rule and with the baseline ignored (the
// rule reads `ignoreEnv`), so the result is every case the rule finds today.

import console from 'node:console';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(import.meta.url), '../../..');
const LINTED = ['src', 'locales/tools', 'packages'];

/**
 * @param {object} options
 * @param {string} options.rule - the rule id, e.g. waldur-custom/no-hand-rolled-table
 * @param {string} options.ignoreEnv - env var the rule reads; set to 'ignore'
 * @param {string} options.file - baseline file name at the repository root
 * @param {(messages: object[]) => unknown} options.summarize - the file's
 *   entry from its unsuppressed messages for the rule; falsy leaves it out
 * @param {(baseline: object) => string} options.describe - the summary line
 */
export async function writeRuleBaseline({
  rule,
  ignoreEnv,
  file,
  summarize,
  describe,
}) {
  // Before ESLint loads the plugin, which reads it at module scope.
  process.env[ignoreEnv] = 'ignore';
  const { ESLint } = await import('eslint');

  const eslint = new ESLint({
    cwd: root,
    ruleFilter: ({ ruleId }) => ruleId === rule,
  });
  const results = await eslint.lintFiles(LINTED);

  const baseline = {};
  for (const result of results) {
    const messages = result.messages.filter((m) => m.ruleId === rule);
    const fatal = messages.find((m) => m.fatal);
    if (fatal) throw new Error(`${result.filePath}: ${fatal.message}`);
    const entry = messages.length ? summarize(messages) : null;
    if (entry) {
      const key = path
        .relative(root, result.filePath)
        .split(path.sep)
        .join('/');
      baseline[key] = entry;
    }
  }

  const sorted = Object.fromEntries(
    Object.entries(baseline).sort(([a], [b]) => a.localeCompare(b)),
  );
  // Formatted as prettier (which lint-staged runs) would, so a rewrite only
  // shows real changes.
  const prettier = await import('prettier');
  const target = path.join(root, file);
  writeFileSync(
    target,
    await prettier.format(JSON.stringify(sorted), {
      ...(await prettier.resolveConfig(target)),
      filepath: target,
    }),
  );
  console.log(`${file}: ${describe(sorted)}`);
}
