/**
 * ESLint rule: Bootstrap layout utilities to Tailwind equivalents.
 *
 * Bootstrap layout utilities (display, flexbox direction/alignment/justification,
 * sizing and truncation) have direct, semantically identical Tailwind equivalents:
 *
 *   d-flex                 → flex
 *   d-block                → block
 *   d-none                 → hidden
 *   d-inline               → inline
 *   d-inline-block         → inline-block
 *   d-inline-flex          → inline-flex
 *   d-grid                 → grid
 *   d-md-none              → md:hidden
 *   flex-column            → flex-col
 *   align-items-center     → items-center
 *   justify-content-between → justify-between
 *   flex-grow-1            → grow
 *   flex-shrink-0          → shrink-0
 *   w-100                  → w-full
 *   h-100                  → h-full
 *   text-truncate          → truncate
 *
 * This rule reports all such classes and autofixes them to their Tailwind counterparts.
 */

import { notAClassList } from './class-name-tokens.js';

const BP_MAP = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
  xxl: '2xl',
};

const DISPLAY_MAP = {
  none: 'hidden',
  block: 'block',
  flex: 'flex',
  inline: 'inline',
  'inline-block': 'inline-block',
  'inline-flex': 'inline-flex',
  grid: 'grid',
  table: 'table',
  'table-row': 'table-row',
  'table-cell': 'table-cell',
};

const STATIC_LAYOUT_MAP = {
  // Display
  'd-none': 'hidden',
  'd-block': 'block',
  'd-flex': 'flex',
  'd-inline': 'inline',
  'd-inline-block': 'inline-block',
  'd-inline-flex': 'inline-flex',
  'd-grid': 'grid',
  'd-table': 'table',
  'd-table-row': 'table-row',
  'd-table-cell': 'table-cell',

  // Flex Direction
  'flex-column': 'flex-col',
  'flex-column-reverse': 'flex-col-reverse',

  // Flex Alignment
  'align-items-start': 'items-start',
  'align-items-end': 'items-end',
  'align-items-center': 'items-center',
  'align-items-baseline': 'items-baseline',
  'align-items-stretch': 'items-stretch',

  // Flex Self Alignment
  'align-self-start': 'self-start',
  'align-self-end': 'self-end',
  'align-self-center': 'self-center',
  'align-self-baseline': 'self-baseline',
  'align-self-stretch': 'self-stretch',
  'align-self-auto': 'self-auto',

  // Flex Justification
  'justify-content-start': 'justify-start',
  'justify-content-end': 'justify-end',
  'justify-content-center': 'justify-center',
  'justify-content-between': 'justify-between',
  'justify-content-around': 'justify-around',
  'justify-content-evenly': 'justify-evenly',

  // Flex Grow / Shrink / Fill
  'flex-fill': 'flex-1',
  'flex-grow-0': 'grow-0',
  'flex-grow-1': 'grow',
  'flex-shrink-0': 'shrink-0',
  'flex-shrink-1': 'shrink',

  // Sizing
  'w-100': 'w-full',
  'h-100': 'h-full',
  'mw-100': 'max-w-full',
  'mh-100': 'max-h-full',

  // Text
  'text-truncate': 'truncate',
};

const getLayoutReplacement = (name) => {
  if (STATIC_LAYOUT_MAP[name]) return STATIC_LAYOUT_MAP[name];

  let m =
    /^d-(sm|md|lg|xl|xxl)-(none|block|flex|inline|inline-block|inline-flex|grid|table|table-row|table-cell)$/.exec(
      name,
    );
  if (m) {
    const bp = BP_MAP[m[1]];
    const display = DISPLAY_MAP[m[2]];
    return `${bp}:${display}`;
  }

  m =
    /^flex-(sm|md|lg|xl|xxl)-(column|column-reverse|row|row-reverse|wrap|nowrap|fill|grow-0|grow-1|grow|shrink-0|shrink-1|shrink)$/.exec(
      name,
    );
  if (m) {
    const bp = BP_MAP[m[1]];
    const val = m[2];
    if (val === 'column') return `${bp}:flex-col`;
    if (val === 'column-reverse') return `${bp}:flex-col-reverse`;
    if (val === 'row') return `${bp}:flex-row`;
    if (val === 'row-reverse') return `${bp}:flex-row-reverse`;
    if (val === 'wrap') return `${bp}:flex-wrap`;
    if (val === 'nowrap') return `${bp}:flex-nowrap`;
    if (val === 'fill') return `${bp}:flex-1`;
    if (val === 'grow' || val === 'grow-1') return `${bp}:grow`;
    if (val === 'grow-0') return `${bp}:grow-0`;
    if (val === 'shrink' || val === 'shrink-0') return `${bp}:shrink-0`;
    if (val === 'shrink-1') return `${bp}:shrink`;
  }

  m =
    /^align-items-(sm|md|lg|xl|xxl)-(start|end|center|baseline|stretch)$/.exec(
      name,
    );
  if (m) return `${BP_MAP[m[1]]}:items-${m[2]}`;

  m =
    /^align-self-(sm|md|lg|xl|xxl)-(start|end|center|baseline|stretch|auto)$/.exec(
      name,
    );
  if (m) return `${BP_MAP[m[1]]}:self-${m[2]}`;

  m =
    /^justify-content-(sm|md|lg|xl|xxl)-(start|end|center|between|around|evenly)$/.exec(
      name,
    );
  if (m) return `${BP_MAP[m[1]]}:justify-${m[2]}`;

  return null;
};

/** hover:!d-flex → { prefix: 'hover:!', name: 'd-flex', suffix: '' }. */
const split = (token) => {
  const m = /^((?:[\w[\]&=*-]+:)*!?)(.+?)(!?)$/.exec(token);
  return m ? { prefix: m[1], name: m[2], suffix: m[3] } : null;
};

const escape = (s) => s.replace(/[[\]()|\\.*+?^$-]/g, '\\$&');

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Report Bootstrap layout utilities (display, flexbox, sizing, truncate) and autofix to Tailwind equivalents',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      layoutUtility:
        '"{{ token }}" is a Bootstrap layout utility. Use "{{ fix }}" instead.',
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
        const replacement = getLayoutReplacement(name);
        if (replacement) {
          const fix = prefix + replacement + suffix;
          // Find token location within node text safely using word boundary
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
              messageId: 'layoutUtility',
              data: { token, fix },
              fix: (fixer) =>
                fixer.replaceTextRange([tokenStart, tokenEnd], fix),
            });
          } else {
            context.report({
              node,
              messageId: 'layoutUtility',
              data: { token, fix },
            });
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
    };
  },
};
