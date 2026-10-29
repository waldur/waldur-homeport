/**
 * ESLint rule: no new hard-coded colour.
 *
 * A hex value, an `rgb()`/`hsl()` call or a named colour in a style object,
 * an SVG `fill`/`stroke`, chart options or tooltip HTML is the same colour in
 * both themes and ignores the brand. The class-name rules never see one, as
 * it is not a class.
 *
 * Finding them is left to the detector `yarn colors:check` runs
 * (packages/design-tokens/scripts/color-literals.mjs), so the rule and CI
 * always agree on what a colour is and which files are covered. Existing
 * literals are counted per file in scripts/color-literals.baseline.json; the
 * rule reports a file's literals only once it has more than its count, each
 * with the ramp step it equals (=) or is closest to (≈). That is the editor
 * and pre-commit view of the CI ratchet: it flags the literal you just typed,
 * and has nothing to say about a file you did not make worse.
 *
 * Options: `{ baseline: { [repoPath]: count } }` replaces the baseline file
 * (tests).
 */

import { existsSync, readFileSync } from 'node:fs';

import {
  BASELINE,
  findColorLiterals,
  isCovered,
  loadRampIndex,
  repoPath,
} from '../../design-tokens/scripts/color-literals.mjs';

let rampIndex;
let baselineFile;

const readBaseline = () =>
  (baselineFile ??= existsSync(BASELINE)
    ? JSON.parse(readFileSync(BASELINE, 'utf8'))
    : {});

const HINTS = {
  hex: 'a text-*/bg-*/border-* utility, getChartThemeColors() in a chart, or currentColor in SVG',
  function:
    'a text-*/bg-*/border-* utility, getChartThemeColors() in a chart, or a token with an opacity modifier (bg-primary/50)',
  named:
    'a text-*/bg-*/border-* utility, getChartThemeColors() in a chart, or currentColor in SVG',
};

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow new hard-coded colours (hex, rgb()/hsl(), named) beyond a file’s count in scripts/color-literals.baseline.json',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          baseline: {
            type: 'object',
            additionalProperties: { type: 'integer' },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      literal:
        '"{{ value }}" is a hard-coded colour{{ token }}; this file has {{ count }}, its baseline allows {{ allowed }}. Use {{ hint }} (docs/design-tokens.md → "Hard-coded colours").',
    },
  },

  create(context) {
    const file = repoPath(context.filename);
    if (!isCovered(file)) return {};

    return {
      'Program:exit'() {
        const baseline = context.options[0]?.baseline ?? readBaseline();
        const allowed = baseline[file] ?? 0;
        rampIndex ??= loadRampIndex();
        const literals = findColorLiterals(
          context.sourceCode.text,
          file,
          rampIndex,
        );
        if (literals.length <= allowed) return;

        for (const { kind, value, line, column, token } of literals) {
          context.report({
            loc: {
              start: { line, column: column - 1 },
              end: { line, column: column - 1 + value.length },
            },
            messageId: 'literal',
            data: {
              value,
              token: token
                ? ` (${token.exact ? '=' : '≈'} ${token.token})`
                : '',
              count: literals.length,
              allowed,
              hint: HINTS[kind],
            },
          });
        }
      },
    };
  },
};
