#!/usr/bin/env node
// Rewrites hand-rolled-table.baseline.json: for each file, how many raw
// <table> elements waldur-custom/no-hand-rolled-table counts there today.
// Run it after migrating tables (to Table, SimpleTable, PropertyList or
// allow-listed waldur-ui primitives; the rule reports a count the file no
// longer reaches as stale); never to make a new table pass.
//
//   yarn lint:tables:baseline

import { writeRuleBaseline } from './lib/rule-baseline.mjs';

await writeRuleBaseline({
  rule: 'waldur-custom/no-hand-rolled-table',
  ignoreEnv: 'WALDUR_HAND_ROLLED_TABLE_BASELINE',
  file: 'hand-rolled-table.baseline.json',
  // A table under an eslint-disable directive is a deliberate exception: the
  // rule leaves it out of the count, and ESLint suppresses its message.
  summarize: (messages) => messages.length,
  describe: (baseline) =>
    `${Object.values(baseline).reduce((a, b) => a + b, 0)} table(s) in ${Object.keys(baseline).length} file(s).`,
});
