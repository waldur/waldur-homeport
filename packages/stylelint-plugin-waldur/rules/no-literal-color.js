/**
 * Stylelint rule: no new hard-coded colour in a stylesheet.
 *
 * The stylesheet half of waldur-custom/no-literal-color: the same detector
 * (packages/design-tokens/scripts/color-literals.mjs) against the same
 * baseline (scripts/color-literals.baseline.json), so the editor, `yarn
 * style:check` and the `yarn colors:check` ratchet agree. A file's literals
 * are reported once it has more than its baseline count, each with the ramp
 * step it equals (=) or is closest to (≈).
 *
 * Secondary option: `{ baseline: { [repoPath]: count } }` replaces the
 * baseline file (tests).
 */

import { existsSync, readFileSync } from 'node:fs';

import stylelint from 'stylelint';

import {
  BASELINE,
  findColorLiterals,
  isCovered,
  loadRampIndex,
  repoPath,
} from '../../design-tokens/scripts/color-literals.mjs';

export const ruleName = 'waldur/no-literal-color';

const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (value, token, count, allowed) =>
    `"${value}" is a hard-coded colour${token}; this file has ${count}, its baseline allows ${allowed}. Use a --text-*, --bg-*, --border-* or --status-* token (docs/design-tokens.md → "Hard-coded colours").`,
});

let rampIndex;
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
  rampIndex ??= loadRampIndex();
  const literals = findColorLiterals(input.css, file, rampIndex);
  if (literals.length <= allowed) return;

  for (const { value, line, column, token } of literals) {
    stylelint.utils.report({
      message: messages.rejected(
        value,
        token ? ` (${token.exact ? '=' : '≈'} ${token.token})` : '',
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
