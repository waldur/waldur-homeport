/**
 * ESLint rule: font size is one scale.
 *
 * The scale is the pinned sizes in primitives/typography.css:
 *
 *   text-xs 12px · text-sm 14px · text-base 16px · text-lg 18px ·
 *   text-xl 20px · text-2xl 24px · text-3xl 30px · text-4xl 36px
 *
 * The rule reports, in class lists:
 *
 * - `retired`: a Bootstrap `fs-*` class. Bootstrap no longer emits them, so
 *   each is autofixed to the Tailwind utility of the matching size.
 * - `offScale`: an arbitrary `text-[Npx]` (or `text-[length:Npx]`) utility
 *   that has a named token on the scale.
 * - `rem`: an arbitrary rem size, `text-[1.077rem]` or `text-[length:…rem]`.
 *   rem follows HomePort's 13px root, which drops to 12px on phones while the
 *   tokens do not, so the two drift apart.
 *
 * Both name the token the size equals (rem at the 13px root) but are not
 * autofixed: the arbitrary class sets only a font size, while a text-* token
 * also sets a line height, which a person should check. The Tailwind
 * size/line-height form (`text-[1.077rem]/5`) is reported the same way.
 * Arbitrary px sizes below the scale, 10px and 11px, are not reported yet:
 * see docs/design-tokens.md.
 *
 * and, on a JSX element, `inline`: a `style={{ fontSize }}`, which outranks
 * every stylesheet and skips the scale.
 */

import { inJsxStyle } from '../lib/jsx-style.js';

import { notAClassList } from './class-name-tokens.js';

const BP_MAP = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
  xxl: '2xl',
};

/** Bootstrap's former font-size classes to Tailwind classes. */
const RETIRED_FONT_SIZES = {
  'fs-8': 'text-xs',
  'fs-7': 'text-xs',
  'fs-6': 'text-sm',
  'fs-5': 'text-base',
  'fs-4': 'text-base',
  'fs-3': 'text-lg',
  'fs-2': 'text-xl',
  'fs-1': 'text-2xl',
  'fs-1x': 'text-2xl',
  'fs-2x': 'text-3xl',
  'fs-2hx': 'text-4xl',
};

/** px sizes on the scale. Also read by stylelint's waldur/font-size-scale. */
export const ARBITRARY_PIXELS_TO_NAMED = {
  '12px': 'text-xs',
  '14px': 'text-sm',
  '16px': 'text-base',
  '18px': 'text-lg',
  '20px': 'text-xl',
  '24px': 'text-2xl',
  '30px': 'text-3xl',
  '36px': 'text-4xl',
};

/**
 * rem sizes that equal a token at HomePort's 13px root. Also read by
 * stylelint's waldur/font-size-scale.
 */
export const REM_TO_NAMED = {
  '0.925rem': 'text-xs',
  '1.077rem': 'text-sm',
  '1.25rem': 'text-base',
  '1.385rem': 'text-lg',
  '1.54rem': 'text-xl',
  '1.75rem': 'text-2xl',
};

/**
 * hover:!fs-6 → { prefix: 'hover:!', name: 'fs-6', suffix: '' }. A bracket
 * group, with one level of nested brackets, is taken whole: the colon in
 * `text-[length:14px]` is not a variant separator, while `[&>a]:` and
 * `[&_[data-x]]:` are variants.
 */
const split = (token) => {
  const m =
    /^((?:(?:[\w&=*-]|\[(?:[^[\]]|\[[^\]]*\])*\])+:)*!?)(.+?)(!?)$/.exec(token);
  return m ? { prefix: m[1], name: m[2], suffix: m[3] } : null;
};

const escape = (s) => s.replace(/[[\]()|\\.*+?^$-]/g, '\\$&');

const getFontSizeReplacement = (name) => {
  if (RETIRED_FONT_SIZES[name]) return RETIRED_FONT_SIZES[name];
  const m = /^fs-(sm|md|lg|xl|xxl)-([0-9][a-z0-9]*)$/.exec(name);
  if (m) {
    const bp = BP_MAP[m[1]];
    const baseClass = RETIRED_FONT_SIZES[`fs-${m[2]}`];
    if (baseClass) {
      return `${bp}:${baseClass}`;
    }
  }
  return null;
};

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Use the font-size scale (text-xs … text-4xl) instead of Bootstrap fs-*, off-scale arbitrary px or inline fontSize',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      retired:
        '"{{ token }}" is a retired Bootstrap font-size class. Use "{{ fix }}" instead.',
      offScale:
        '"{{ token }}" uses an arbitrary pixel value that matches a scale token: use {{ fix }}, and check the line height: a text-* class sets one too.',
      rem: '"{{ token }}" is a rem font size, which shrinks with the 12px phone root while the scale does not. Use {{ fix }}, and check the line height: a text-* class sets one too.',
      inline:
        'Set font size with a class (text-xs, text-sm, text-base, text-lg, etc.), not an inline style.',
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

        const replacement = getFontSizeReplacement(name);
        if (replacement) {
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

        const arbMatch =
          /^text-\[(?:length:)?([\d.]+(?:px|rem))\](\/\S+)?$/.exec(name);
        if (!arbMatch) continue;
        const [, size, lineHeight = ''] = arbMatch;
        const isRem = size.endsWith('rem');
        const named = (isRem ? REM_TO_NAMED : ARBITRARY_PIXELS_TO_NAMED)[size];
        if (!named && !isRem) continue;
        context.report({
          node,
          messageId: isRem ? 'rem' : 'offScale',
          data: {
            token,
            fix: named
              ? `"${prefix + named + lineHeight + suffix}"`
              : 'the nearest text-xs … text-4xl class',
          },
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
      Property(node) {
        const key = node.key.name ?? node.key.value;
        if (key === 'fontSize' && inJsxStyle(node)) {
          context.report({ node, messageId: 'inline' });
        }
      },
    };
  },
};
