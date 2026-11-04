#!/usr/bin/env node
// Rewrites typed-property.baseline.json: for each file, how many PropertyItem
// rows of each kind waldur-custom/prefer-typed-property reports there today.
// Run it after moving rows onto typed properties (the rule reports a count
// the file no longer reaches as stale); never to make a new row pass.
//
//   yarn lint:properties:baseline

import { writeRuleBaseline } from './lib/rule-baseline.mjs';

// The kind is the replacement the message names; `renderFieldOrDash` rows
// carry no replacement component.
const kindOf = (message) =>
  message.match(/use <([^>]+)> from/)?.[1] ?? 'value={x}';

await writeRuleBaseline({
  rule: 'waldur-custom/prefer-typed-property',
  ignoreEnv: 'WALDUR_TYPED_PROPERTY_BASELINE',
  file: 'typed-property.baseline.json',
  summarize: (messages) => {
    const counts = {};
    for (const { message } of messages) {
      const kind = kindOf(message);
      counts[kind] = (counts[kind] ?? 0) + 1;
    }
    return Object.fromEntries(
      Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)),
    );
  },
  describe: (baseline) =>
    `${Object.values(baseline)
      .flatMap(Object.values)
      .reduce(
        (a, b) => a + b,
        0,
      )} row(s) in ${Object.keys(baseline).length} file(s).`,
});
