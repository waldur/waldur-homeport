/**
 * ESLint rule: font weight is one scale.
 *
 * The scale is the five weights fonts.css loads, as Tailwind utilities
 * (primitives/typography.css):
 *
 *   font-light 300 · font-normal 400 · font-medium 500 · font-semibold 600 ·
 *   font-bold 700
 *
 * The rule reports, in class lists:
 *
 * - `retired`: a Bootstrap `fw-*` class. Bootstrap no longer emits them, and
 *   its names meant other weights than Tailwind's (`fw-bold` was 500,
 *   Tailwind's `font-bold` is 700), so each is autofixed to the class with
 *   the weight it painted. `fw-semibold` and `fw-medium` never existed; they
 *   are fixed to the weight their name asks for.
 * - `offScale`: a Tailwind step outside the scale (`font-thin`,
 *   `font-extralight`, `font-extrabold`, `font-black`), which compiles to
 *   nothing since the theme clears it, or an arbitrary `font-[600]`.
 *
 * and, on a JSX element, `inline`: a `style={{ fontWeight }}`, which outranks
 * every stylesheet and skips the scale. Chart and PDF options that happen to
 * have a fontWeight key are not styles and are not reported.
 */

import { notAClassList } from './class-name-tokens.js';

/** Bootstrap's former weight classes, to the Tailwind class of the same weight. */
export const RETIRED_WEIGHTS = {
  'fw-light': 'font-light',
  'fw-normal': 'font-normal',
  'fw-bold': 'font-medium',
  'fw-bolder': 'font-semibold',
  'fw-boldest': 'font-bold',
  'fw-semibold': 'font-semibold',
  'fw-medium': 'font-medium',
};

const OFF_SCALE = /^font-(?:thin|extralight|extrabold|black|\[[^\]]+\])$/;
const ARBITRARY_TO_NAMED = {
  300: 'font-light',
  400: 'font-normal',
  500: 'font-medium',
  600: 'font-semibold',
  700: 'font-bold',
};

/** `hover:!fw-bold` → { prefix: 'hover:!', name: 'fw-bold' }. */
const split = (token) => {
  const m = /^((?:[\w[\]&=*-]+:)*!?)(.+?)(!?)$/.exec(token);
  return m ? { prefix: m[1], name: m[2], suffix: m[3] } : null;
};

const escape = (s) => s.replace(/[[\]()|\\.*+?^$-]/g, '\\$&');

/** Is this `fontWeight` property part of a JSX `style` value? */
const inJsxStyle = (property) => {
  let node = property.parent;
  while (
    node &&
    [
      'ObjectExpression',
      'ConditionalExpression',
      'LogicalExpression',
      'JSXExpressionContainer',
    ].includes(node.type)
  ) {
    node = node.parent;
  }
  return node?.type === 'JSXAttribute' && node.name.name === 'style';
};

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Use the font-weight scale (font-light … font-bold) instead of Bootstrap fw-*, off-scale steps or inline fontWeight',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      retired:
        '"{{ token }}" is a retired Bootstrap weight class. Use "{{ fix }}" (the same weight).',
      offScale:
        '"{{ token }}" is outside the font-weight scale: use font-light, font-normal, font-medium, font-semibold or font-bold{{ hint }}.',
      inline:
        'Set font weight with a class (font-normal, font-medium, font-semibold, font-bold), not an inline style.',
    },
  },

  create(context) {
    const { sourceCode } = context;

    const check = (node, text) => {
      for (const token of text.split(/\s+/).filter(Boolean)) {
        const parts = split(token);
        if (!parts) continue;
        const { prefix, name, suffix } = parts;
        const named = RETIRED_WEIGHTS[name];
        if (named) {
          const fix = prefix + named + suffix;
          context.report({
            node,
            messageId: 'retired',
            data: { token, fix },
            fix: (fixer) =>
              fixer.replaceText(
                node,
                sourceCode
                  .getText(node)
                  .replace(
                    new RegExp(
                      `(?<=^|[\\s'"\`}])${escape(token)}(?=$|[\\s'"\`$])`,
                    ),
                    fix,
                  ),
              ),
          });
        } else if (OFF_SCALE.test(name)) {
          const value = /^font-\[(\d+)\]$/.exec(name)?.[1];
          const hint = ARBITRARY_TO_NAMED[value]
            ? ` (here: ${ARBITRARY_TO_NAMED[value]})`
            : '';
          context.report({
            node,
            messageId: 'offScale',
            data: { token, hint },
          });
        }
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
      Property(node) {
        const key = node.key.name ?? node.key.value;
        if (key === 'fontWeight' && inJsxStyle(node)) {
          context.report({ node, messageId: 'inline' });
        }
      },
    };
  },
};
