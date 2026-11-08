#!/usr/bin/env node
// Rewrites inline-style.baseline.json: for each file, how many inline
// declarations of each CSS property waldur-custom/no-static-inline-style
// reports there today. Run it after moving declarations onto utilities (the
// rule reports a count the file no longer reaches as stale); never to make a
// new inline style pass.
//
//   yarn lint:styles:baseline
//
// The staged plan behind the baseline is
// docs/inline-style-retirement-plan.md.

import { writeRuleBaseline } from './lib/rule-baseline.mjs';

// The property is the one the message names: "this inline `maxWidth`".
const propertyOf = (message) => message.match(/inline `([^`]+)`/)?.[1];

await writeRuleBaseline({
  rule: 'waldur-custom/no-static-inline-style',
  ignoreEnv: 'WALDUR_INLINE_STYLE_BASELINE',
  file: 'inline-style.baseline.json',
  summarize: (messages) => {
    const counts = {};
    for (const { message } of messages) {
      const property = propertyOf(message);
      // A stale report names no property; it disappears once the counts are
      // rewritten, so it must not become an entry of its own.
      if (!property) continue;
      counts[property] = (counts[property] ?? 0) + 1;
    }
    return Object.keys(counts).length
      ? Object.fromEntries(
          Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)),
        )
      : null;
  },
  describe: (baseline) => {
    const files = Object.keys(baseline).length;
    const declarations = Object.values(baseline).reduce(
      (total, counts) =>
        total + Object.values(counts).reduce((a, b) => a + b, 0),
      0,
    );
    return `${declarations} inline declaration(s) in ${files} file(s)`;
  },
});
