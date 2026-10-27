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
 *   mw-100                 → max-w-full
 *   min-w-125px            → min-w-[125px]
 *   text-truncate          → truncate
 *   flex-center            → items-center justify-center (or flex items-center justify-center)
 *   flex-root              → flex-1
 *   flex-equal             → flex-1
 *   flex-column-fluid      → flex-auto
 *   flex-column-auto       → flex-none
 *   flex-lg-row-fluid      → lg:flex-auto lg:min-w-0
 *   flex-sm-column-auto    → sm:flex-none
 *   order-sm-2             → sm:order-2
 *
 * This rule reports all such classes and autofixes them to their Tailwind counterparts.
 *
 * One exception: Bootstrap emits `.flex-wrap` and `.flex-nowrap` with
 * `!important`, under the same names Tailwind uses, so `flex-wrap sm:flex-nowrap`
 * never stops wrapping. When the class list keeps such a base, a responsive
 * `flex-sm-nowrap` / `flex-sm-wrap` is reported without a fix: write
 * `max-sm:flex-wrap` (or `max-sm:flex-nowrap`) in place of both classes.
 *
 * Another: `w-50`, `h-25`, `min-w-75`, `min-h-100` (and the rest of
 * w/h/min-w/min-h × 25/50/75/100) are also Tailwind spacing classes, and
 * Bootstrap no longer generates them (#473), so new code using one may mean
 * Tailwind's `w-50` (200px). They are reported without a fix, with a
 * suggestion for each reading: `w-1/2` (Bootstrap's 50%) or `w-[200px]`.
 * The position offsets `top`/`bottom`/`start`/`end` × 25/50/75/100 are the
 * same case since Bootstrap stopped generating them (#478): `start-50` was
 * `left: 50%`, Tailwind's is 200px.
 *
 * `text-nowrap` and `text-wrap` become `whitespace-nowrap` and
 * `whitespace-normal`: Bootstrap's set `white-space`, Tailwind's the newer
 * `text-wrap` property, which older browsers ignore. `text-md-center` and the
 * other breakpoint text alignments become `md:text-center`.
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

  // Metronic Flex Helpers
  'flex-center': 'flex items-center justify-center',
  'flex-root': 'flex-1',
  'flex-equal': 'flex-1',
  'flex-column-auto': 'flex-none',
  'flex-column-fluid': 'flex-auto',
  'flex-row-fluid': 'flex-auto min-w-0',

  // Sizing
  'w-100': 'w-full',
  'h-100': 'h-full',
  'mw-100': 'max-w-full',
  'mh-100': 'max-h-full',

  // Text. Tailwind's text-nowrap/text-wrap set the newer `text-wrap`
  // property; Bootstrap's set `white-space`, which whitespace-* still does.
  'text-truncate': 'truncate',
  'text-nowrap': 'whitespace-nowrap',
  'text-wrap': 'whitespace-normal',
};

const SIZE_PROP_MAP = {
  w: 'w',
  mw: 'max-w',
  'min-w': 'min-w',
  h: 'h',
  mh: 'max-h',
  'min-h': 'min-h',
};

const SIZE_VALUE_MAP = {
  25: '1/4',
  50: '1/2',
  75: '3/4',
  100: 'full',
  auto: 'auto',
  unset: '[unset]',
};

const SIZE_RE =
  /^(w|mw|min-w|h|mh|min-h)(?:-(sm|md|lg|xl|xxl))?-(\d+px|25|50|75|100|auto|unset)$/;

// Bootstrap percentages whose names Tailwind also defines, as multiples of
// its 4px spacing unit (packages/design-tokens/src/css/primitives/spacing.css).
const AMBIGUOUS_SIZE_RE =
  /^(w|h|min-w|min-h|top|bottom|start|end)-(25|50|75|100)$/;
const SPACING_PX = 4;

/** w-50 → { percent: 'w-1/2', pixels: 'w-[200px]' }, else null. */
const getAmbiguousSize = (name) => {
  const m = AMBIGUOUS_SIZE_RE.exec(name);
  if (!m) return null;
  return {
    percent: getLayoutReplacement(name),
    pixels: `${m[1]}-[${Number(m[2]) * SPACING_PX}px]`,
  };
};

const getSizeReplacement = (name) => {
  const m = SIZE_RE.exec(name);
  if (!m) return null;
  const prop = SIZE_PROP_MAP[m[1]];
  const bp = m[2] ? BP_MAP[m[2]] : null;
  const rawVal = m[3];
  let val;
  if (rawVal.endsWith('px')) {
    val = `[${rawVal}]`;
  } else if (rawVal === 'auto' && (prop === 'max-w' || prop === 'max-h')) {
    val = 'none';
  } else {
    val = SIZE_VALUE_MAP[rawVal];
  }
  const base = `${prop}-${val}`;
  const replacement = bp ? `${bp}:${base}` : base;
  return replacement === name ? null : replacement;
};

export const getLayoutReplacement = (name) => {
  if (STATIC_LAYOUT_MAP[name]) return STATIC_LAYOUT_MAP[name];

  const size = getSizeReplacement(name);
  if (size) return size;

  // Bootstrap's position offsets were percentages (#478).
  let m = /^(top|bottom|start|end)-(25|50|75|100)$/.exec(name);
  if (m) return `${m[1]}-${SIZE_VALUE_MAP[m[2]]}`;

  m = /^text-(sm|md|lg|xl|xxl)-(start|end|center)$/.exec(name);
  if (m) return `${BP_MAP[m[1]]}:text-${m[2]}`;

  m =
    /^d-(sm|md|lg|xl|xxl)-(none|block|flex|inline|inline-block|inline-flex|grid|table|table-row|table-cell)$/.exec(
      name,
    );
  if (m) {
    const bp = BP_MAP[m[1]];
    const display = DISPLAY_MAP[m[2]];
    return `${bp}:${display}`;
  }

  m =
    /^flex-(sm|md|lg|xl|xxl)-(column|column-reverse|row|row-reverse|wrap|nowrap|fill|grow-0|grow-1|grow|shrink-0|shrink-1|shrink|column-auto|column-fluid|row-fluid|center|root|equal)$/.exec(
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
    if (val === 'column-auto') return `${bp}:flex-none`;
    if (val === 'column-fluid') return `${bp}:flex-auto`;
    if (val === 'row-fluid') return `${bp}:flex-auto ${bp}:min-w-0`;
    if (val === 'center') return `${bp}:items-center ${bp}:justify-center`;
    if (val === 'root' || val === 'equal') return `${bp}:flex-1`;
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

  // Bootstrap's order-0…5/first/last keep their names in Tailwind; only the
  // breakpoint infix is Bootstrap's.
  m = /^order-(sm|md|lg|xl|xxl)-(first|last|[0-5])$/.exec(name);
  if (m) return `${BP_MAP[m[1]]}:order-${m[2]}`;

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
    hasSuggestions: true,
    schema: [],
    messages: {
      layoutUtility:
        '"{{ token }}" is a Bootstrap layout utility. Use "{{ fix }}" instead.',
      ambiguousSize:
        '"{{ token }}" was Bootstrap\'s percentage size, but Tailwind reads it as a spacing step. Write "{{ percent }}" for the percentage or "{{ pixels }}" for the fixed size.',
      useReplacement: 'Replace with "{{ fix }}".',
      wrapConflict:
        '"{{ token }}" next to "{{ base }}": Bootstrap\'s !important .{{ base }} would beat "{{ fix }}". Replace both with "{{ alternative }}".',
    },
  },

  create(context) {
    const { sourceCode } = context;

    const check = (node, text) => {
      const sourceText = sourceCode.getText(node);
      let searchOffset = 0;
      const tokens = text.split(/\s+/).filter(Boolean);

      for (const token of tokens) {
        const parts = split(token);
        if (!parts) continue;
        const { prefix, name, suffix } = parts;
        let replacement = getLayoutReplacement(name);
        if (
          name === 'flex-center' &&
          (tokens.includes('flex') ||
            tokens.includes('inline-flex') ||
            tokens.includes('d-flex') ||
            tokens.includes('d-inline-flex'))
        ) {
          replacement = 'items-center justify-center';
        }
        const wrap = /^flex-(sm|md|lg|xl|xxl)-(wrap|nowrap)$/.exec(name);
        const base =
          wrap && (wrap[2] === 'nowrap' ? 'flex-wrap' : 'flex-nowrap');
        if (replacement && !prefix && base && tokens.includes(base)) {
          context.report({
            node,
            messageId: 'wrapConflict',
            data: {
              token,
              base,
              fix: replacement,
              alternative: `max-${BP_MAP[wrap[1]]}:${base}`,
            },
          });
        } else if (replacement) {
          const fix = replacement
            .split(/\s+/)
            .map((cls) => prefix + cls + suffix)
            .join(' ');
          // Find token location within node text safely using word boundary
          const regex = new RegExp(
            `(?<=^|[\\s'"\`}])${escape(token)}(?=$|[\\s'"\`$])`,
            'g',
          );
          regex.lastIndex = searchOffset;
          const match = regex.exec(sourceText);
          const ambiguous = getAmbiguousSize(name);
          if (ambiguous) {
            const range = match && [
              node.range[0] + match.index,
              node.range[0] + match.index + token.length,
            ];
            if (match) searchOffset = match.index + token.length;
            const options = [ambiguous.percent, ambiguous.pixels].map(
              (value) => prefix + value + suffix,
            );

            context.report({
              node,
              messageId: 'ambiguousSize',
              data: { token, percent: options[0], pixels: options[1] },
              suggest: range
                ? options.map((option) => ({
                    messageId: 'useReplacement',
                    data: { fix: option },
                    fix: (fixer) => fixer.replaceTextRange(range, option),
                  }))
                : [],
            });
          } else if (match) {
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
