/**
 * ESLint rule: enforce border radius design tokens from design-tokens/primitives/radius.css.
 *
 * Scale:
 *   rounded-none (0px)
 *   rounded-xs (2px)
 *   rounded-sm (4px)
 *   rounded-md (6px)
 *   rounded-lg (8px)
 *   rounded-xl (12px)
 *   rounded-2xl (16px)
 *   rounded-modal (20px)
 *   rounded-full (9999px)
 *
 * The rule reports and autofixes:
 * - `retired`: legacy Bootstrap radius classes (`rounded-0` -> `rounded-none`,
 *   `rounded-pill` -> `rounded-full`, `rounded-circle` -> `rounded-full`).
 * - `offScale`: arbitrary pixel classes matching a scale token
 *   (e.g. `rounded-[6px]` -> `rounded-md`, `rounded-[8px]` -> `rounded-lg`).
 * - `inline`: inline `style={{ borderRadius: ... }}` in JSX elements.
 */

import { notAClassList } from './class-name-tokens.js';

const RETIRED_BOOTSTRAP = {
  'rounded-0': 'rounded-none',
  'rounded-pill': 'rounded-full',
  'rounded-circle': 'rounded-full',
  'rounded-top-0': 'rounded-t-none',
  'rounded-bottom-0': 'rounded-b-none',
  'rounded-start-0': 'rounded-s-none',
  'rounded-end-0': 'rounded-e-none',
};

const ARBITRARY_PIXELS_TO_NAMED = {
  '0px': 'none',
  0: 'none',
  '2px': 'xs',
  '4px': 'sm',
  '6px': 'md',
  '8px': 'lg',
  '12px': 'xl',
  '16px': '2xl',
  '20px': 'modal',
};

const split = (token) => {
  const m = /^((?:[\w[\]&=*-]+:)*!?)(.+?)(!?)$/.exec(token);
  return m ? { prefix: m[1], name: m[2], suffix: m[3] } : null;
};

const escape = (s) => s.replace(/[[\]()|\\.*+?^$-]/g, '\\$&');

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

const isBorderRadiusProperty = (name) => {
  return [
    'borderRadius',
    'borderTopLeftRadius',
    'borderTopRightRadius',
    'borderBottomLeftRadius',
    'borderBottomRightRadius',
  ].includes(name);
};

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce border radius design tokens instead of retired Bootstrap classes, arbitrary pixel values, or inline styles',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      retired:
        '"{{ token }}" is a retired Bootstrap radius class. Use "{{ fix }}".',
      offScale:
        '"{{ token }}" uses an arbitrary pixel value on the design scale. Use "{{ fix }}".',
      inline:
        'Set border radius with a class (rounded-sm, rounded-md, rounded-lg, rounded-full, etc.), not an inline style.',
    },
  },

  create(context) {
    const { sourceCode } = context;

    const check = (node, text) => {
      const sourceText = sourceCode.getText(node);
      let searchOffset = 0;

      for (const token of text.split(/\s+/).filter(Boolean)) {
        const parts = split(token);
        if (!parts) continue;
        const { prefix, name, suffix } = parts;

        // 1. Check retired Bootstrap radius classes
        if (RETIRED_BOOTSTRAP[name]) {
          const replacement = RETIRED_BOOTSTRAP[name];
          const fix = prefix + replacement + suffix;
          const regex = new RegExp(
            `(?<=^|[\\s'"\`}])${escape(token)}(?=$|[\\s'"\`$])`,
            'g',
          );
          regex.lastIndex = searchOffset;
          const match = regex.exec(sourceText);
          if (match) {
            const tokenStart = node.range[0] + match.index;
            const tokenEnd = tokenStart + token.length;
            searchOffset = match.index + token.length;

            context.report({
              node,
              messageId: 'retired',
              data: { token, fix },
              fix: (fixer) =>
                fixer.replaceTextRange([tokenStart, tokenEnd], fix),
            });
          } else {
            context.report({
              node,
              messageId: 'retired',
              data: { token, fix },
            });
          }
          continue;
        }

        // 2. Check arbitrary pixel radius matching the named scale:
        // matches rounded-[6px] or rounded-t-[8px], etc.
        const arbMatch =
          /^rounded(?:-(t|b|l|r|s|e|tl|tr|bl|br))?-\[([^\]]+)\]$/.exec(name);
        if (arbMatch) {
          const dir = arbMatch[1];
          const val = arbMatch[2];
          const namedStep = ARBITRARY_PIXELS_TO_NAMED[val];
          if (namedStep) {
            const replacement = dir
              ? namedStep === 'none'
                ? `rounded-${dir}-none`
                : `rounded-${dir}-${namedStep}`
              : namedStep === 'none'
                ? 'rounded-none'
                : `rounded-${namedStep}`;
            const fix = prefix + replacement + suffix;

            const regex = new RegExp(
              `(?<=^|[\\s'"\`}])${escape(token)}(?=$|[\\s'"\`$])`,
              'g',
            );
            regex.lastIndex = searchOffset;
            const match = regex.exec(sourceText);
            if (match) {
              const tokenStart = node.range[0] + match.index;
              const tokenEnd = tokenStart + token.length;
              searchOffset = match.index + token.length;

              context.report({
                node,
                messageId: 'offScale',
                data: { token, fix },
                fix: (fixer) =>
                  fixer.replaceTextRange([tokenStart, tokenEnd], fix),
              });
            } else {
              context.report({
                node,
                messageId: 'offScale',
                data: { token, fix },
              });
            }
          }
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
        if (isBorderRadiusProperty(key) && inJsxStyle(node)) {
          context.report({ node, messageId: 'inline' });
        }
      },
    };
  },
};
