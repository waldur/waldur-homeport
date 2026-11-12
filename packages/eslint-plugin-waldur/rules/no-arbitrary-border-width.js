/**
 * ESLint rule: a whole-pixel border width is written as Tailwind's step.
 *
 * Tailwind's border widths are standard steps (`border` is 1px, `border-2` is
 * 2px), so arbitrary pixel wrappers should be simplified:
 *
 *   border-[1px]     → border
 *   border-t-[1px]   → border-t
 *   border-x-[2px]   → border-x-2
 *   border-[0px]     → border-0
 *
 * Variants and the important modifier are kept (`hover:border-b-[1px]` →
 * `hover:border-b`). A width that is not a whole number of pixels, or a
 * `[length:…]`/`var()` value, is left alone.
 */

import { notAClassList } from './class-name-tokens.js';

// border, border-t, … then an arbitrary whole-pixel width.
const ARBITRARY_WIDTH = /^(border(?:-[xytblrse])?)-\[(\d+)(?:px)?\]$/;

/** hover:!border-[1px] → { prefix: 'hover:!', name: 'border-[1px]', suffix: '' }. */
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

/** The plain Tailwind spelling of an arbitrary whole-pixel width, or null. */
export const plainBorderWidth = (token) => {
  const { prefix, name, suffix } = split(token);
  const match = ARBITRARY_WIDTH.exec(name);
  if (!match) return null;
  const [, utility, px] = match;
  const step = px === '1' ? utility : `${utility}-${Number(px)}`;
  return prefix + step + suffix;
};

const escape = (s) => s.replace(/[[\]()|\\.*+?^$-]/g, '\\$&');

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Write a whole-pixel border width as the Tailwind step (`border`, `border-t-2`), not an arbitrary value',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      arbitrary:
        'Use "{{ fix }}" for "{{ token }}": Tailwind’s border widths are pixels.',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    const check = (node, text) => {
      const source = sourceCode.getText(node);
      let searchFrom = 0;
      for (const token of text.split(/\s+/).filter(Boolean)) {
        const fix = plainBorderWidth(token);
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
