/**
 * Stylelint rule: no new raw rem length in a stylesheet.
 *
 * HomePort forces a 13px root font size, and a rem length is tuned against
 * it: until none is left, the root cannot go back to the browser default.
 * The stylesheet half of waldur-custom/no-rem-length: the same detector
 * (packages/design-tokens/scripts/rem-literals.mjs) against the same baseline
 * (scripts/rem-literals.baseline.json), so the editor, `yarn style:check` and
 * the `yarn rem:check` ratchet agree. A file's rem lengths are reported once
 * it has more than its baseline count, each with the px it comes to at the
 * 13px root and the spacing or text token that equals it, if any.
 *
 * Secondary option: `{ baseline: { [repoPath]: count } }` replaces the
 * baseline file (tests).
 */

import { existsSync, readFileSync } from 'node:fs';

import stylelint from 'stylelint';

import {
  BASELINE,
  describeRem,
  findRemLiterals,
  isCovered,
  repoPath,
} from '../../design-tokens/scripts/rem-literals.mjs';

export const ruleName = 'waldur/no-rem-length';

const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (description, count, allowed) =>
    `${description}: rem follows the root font size; this file has ${count}, its baseline allows ${allowed}. Write the px, or the token where it is = (≈ is a sub-pixel change: check it) (docs/design-tokens.md → "Root font size").`,
});

let baselineFile;

const readBaseline = () =>
  (baselineFile ??= existsSync(BASELINE)
    ? JSON.parse(readFileSync(BASELINE, 'utf8'))
    : {});

const rule = (primaryOption, secondaryOptions) => (root, result) => {
  const validOptions = stylelint.utils.validateOptions(result, ruleName, {
    actual: primaryOption,
  });
  if (!validOptions || !primaryOption) return;

  const input = root.source?.input;
  if (!input?.file) return;
  const file = repoPath(input.file);
  if (!isCovered(file)) return;

  const baseline = secondaryOptions?.baseline ?? readBaseline();
  const allowed = baseline[file] ?? 0;
  const literals = findRemLiterals(input.css, file);
  if (literals.length <= allowed) return;

  for (const literal of literals) {
    const { value, line, column } = literal;
    stylelint.utils.report({
      message: messages.rejected(
        describeRem(literal),
        literals.length,
        allowed,
      ),
      node: root,
      start: { line, column },
      end: { line, column: column + value.length },
      result,
      ruleName,
    });
  }
};

rule.ruleName = ruleName;
rule.messages = messages;

export default rule;
