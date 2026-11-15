/**
 * ESLint rule: a line height on the spacing grid is written as its step.
 *
 * `--spacing` is pinned to 4px, so Tailwind's `leading-N` is N × 4px and an
 * arbitrary pixel line height that lands on a half step has a utility:
 *
 *   leading-[20px]  → leading-5
 *   leading-[14px]  → leading-3.5
 *   leading-[18px]  → leading-4.5
 *
 * Variants and the important modifier are kept (`md:leading-[24px]` →
 * `md:leading-6`). An odd pixel value (`leading-[17px]`), a unitless ratio
 * (`leading-[1.75]`), a keyword (`leading-[inherit]`) or a `var()` is left
 * alone: those have no step, and moving them changes pixels.
 */

import { notAClassList } from './class-name-tokens.js';

// leading- then an arbitrary whole, even pixel value.
const ARBITRARY_LEADING = /^leading-\[(\d+)px\]$/;

/** md:!leading-[20px] → { prefix: 'md:!', name: 'leading-[20px]', suffix: '' }. */
const split = (token) => {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < token.length; i += 1) {
    if (token[i] === '[') depth += 1;
    else if (token[i] === ']') depth -= 1;
    else if (token[i] === ':' && depth === 0) start = i + 1;
  }
  const head = token.slice(0, start);
  const rest = token.slice(start);
  const important = rest.startsWith('!') ? '!' : '';
  const suffix = rest.endsWith('!') ? '!' : '';
  const name = rest.slice(important.length, rest.length - suffix.length);
  return { prefix: head + important, name, suffix };
};

/** The spacing-step spelling of an arbitrary pixel line height, or null. */
export const plainLeading = (token) => {
  const { prefix, name, suffix } = split(token);
  const match = ARBITRARY_LEADING.exec(name);
  if (!match) return null;
  const px = Number(match[1]);
  if (px % 2 !== 0) return null;
  return `${prefix}leading-${px / 4}${suffix}`;
};

const escape = (s) => s.replace(/[[\]()|\\.*+?^$-]/g, '\\$&');

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Write a line height on the 4px grid as the spacing step (`leading-5`), not an arbitrary pixel value',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      arbitrary: 'Use "{{ fix }}" for "{{ token }}": leading-N is N × 4px.',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    const check = (node, text) => {
      const source = sourceCode.getText(node);
      let searchFrom = 0;
      for (const token of text.split(/\s+/).filter(Boolean)) {
        const fix = plainLeading(token);
        if (!fix) continue;
        const regex = new RegExp(
          `(?<=^|[\\s'"\`}])${escape(token)}(?=$|[\\s'"\`$])`,
          'g',
        );
        regex.lastIndex = searchFrom;
        const match = regex.exec(source);
        if (match) searchFrom = match.index + token.length;
        const start = match && node.range[0] + match.index;
        context.report({
          node,
          messageId: 'arbitrary',
          data: { token, fix },
          fix: match
            ? (fixer) =>
                fixer.replaceTextRange([start, start + token.length], fix)
            : null,
        });
      }
    };

    return {
      Literal(node) {
        if (typeof node.value === 'string' && !notAClassList(node)) {
          check(node, node.value);
        }
      },
      TemplateElement(node) {
        if (!notAClassList(node.parent)) {
          check(node, node.value.cooked ?? node.value.raw);
        }
      },
    };
  },
};
