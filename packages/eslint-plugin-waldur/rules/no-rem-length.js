/**
 * ESLint rule: no new raw rem length.
 *
 * HomePort forces a 13px root font size, and a rem length is tuned against
 * it: until none is left, the root cannot go back to the browser default
 * (docs/design-tokens.md → "Root font size"). The rule covers what TS/TSX
 * writes a length in, arbitrary Tailwind classes (`p-[1.85rem]`,
 * `max-w-[calc(100vw-3rem)]`) and inline style values
 * (`style={{ padding: '0.5rem' }}`): every string and template literal.
 *
 * Finding them is left to the detector `yarn rem:check` runs
 * (packages/design-tokens/scripts/rem-literals.mjs), so the rule, its
 * stylelint twin waldur/no-rem-length and CI agree on what a rem literal is
 * and which files are covered. Existing ones are counted per file in
 * scripts/rem-literals.baseline.json; the rule reports a file's rem lengths
 * only once it has more than its count, each with the px it comes to at the
 * 13px root and the spacing step or text-* utility that equals it, if any.
 *
 * Options: `{ baseline: { [repoPath]: count } }` replaces the baseline file
 * (tests).
 */

import { existsSync, readFileSync } from 'node:fs';

import {
  BASELINE,
  describeRem,
  findRemLiterals,
  isCovered,
  repoPath,
} from '../../design-tokens/scripts/rem-literals.mjs';

let baselineFile;

const readBaseline = () =>
  (baselineFile ??= existsSync(BASELINE)
    ? JSON.parse(readFileSync(BASELINE, 'utf8'))
    : {});

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow new rem lengths (arbitrary classes, inline styles) beyond a file’s count in scripts/rem-literals.baseline.json',
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
      rem: '{{ description }}: rem follows the root font size; this file has {{ count }}, its baseline allows {{ allowed }}. Write the px, or the token where it is = (≈ is a sub-pixel change: check it) (docs/design-tokens.md → "Root font size").',
    },
  },

  create(context) {
    const file = repoPath(context.filename);
    if (!isCovered(file)) return {};

    return {
      'Program:exit'() {
        const baseline = context.options[0]?.baseline ?? readBaseline();
        const allowed = baseline[file] ?? 0;
        const literals = findRemLiterals(context.sourceCode.text, file);
        if (literals.length <= allowed) return;

        for (const literal of literals) {
          const { value, line, column } = literal;
          context.report({
            loc: {
              start: { line, column: column - 1 },
              end: { line, column: column - 1 + value.length },
            },
            messageId: 'rem',
            data: {
              description: describeRem(literal),
              count: literals.length,
              allowed,
            },
          });
        }
      },
    };
  },
};
