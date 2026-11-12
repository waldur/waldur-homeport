/**
 * ESLint rule: a static inline style is a class in disguise.
 *
 * `style={{ maxWidth: '100%', maxHeight: '80px' }}` is three declarations that
 * could be two classes. Every value in it is a literal, so nothing about it
 * needs to be computed at render time — and because an inline style outranks
 * every stylesheet and every utility, each one is also a silent opt-out of the
 * cascade: of dark mode, of responsive variants, and of the token scales the
 * other rules here guard. The auth logo is the cautionary tale: an inline
 * `max-height: 80px` kept `.login-logo img`'s own 600px and 450px media
 * queries from ever applying.
 *
 * The rule reports a property of a JSX `style` object when
 *
 * - every part of its value is a literal (a string, a number, or a template
 *   with no expressions), and
 * - the declaration has a Tailwind utility, which the message names.
 *
 * It stays silent on everything an inline style is genuinely for: a value
 * measured or animated at runtime, a CSS custom property bridging a varying
 * value into a literal utility (the documented pattern — see
 * docs/design-tokens.md), a spread of a caller's `style`,
 * and any declaration with no utility to name (gradients, `maskType`,
 * `animation`). `fontSize`, `fontWeight` and `borderRadius` belong to
 * require-font-size-scale, require-weight-scale and
 * enforce-border-radius-tokens, which report them inline already; this rule
 * leaves them alone rather than reporting them twice.
 *
 * Sizes map through the px-pinned spacing scale (`--spacing: 4px`), never
 * through Tailwind's rem container scale: HomePort forces a 13px root (12px
 * below `md`), so `max-w-xl` is 468px here and 432px on a phone, while
 * `max-w-130` is 520px at any root. A px value that is not a whole or half
 * step is named as an arbitrary utility instead, so that an off-grid 17px is a
 * decision a person makes rather than a `m-4.25` nobody can read.
 *
 * See docs/inline-style-retirement-plan.md.
 */

import {
  inJsxStyle,
  staticStyleValue,
  styleKeyName,
  styleObjectHasSpread,
} from '../lib/jsx-style.js';

/**
 * Declarations whose value is a keyword, mapped to the utility for it.
 * Logical utilities where Tailwind offers both (`text-start`, not
 * `text-left`), matching the codebase, where `ms`/`me`/`ps`/`pe` outnumber
 * their physical spellings about twenty to one.
 */
const KEYWORDS = {
  whiteSpace: {
    normal: 'whitespace-normal',
    nowrap: 'whitespace-nowrap',
    pre: 'whitespace-pre',
    'pre-line': 'whitespace-pre-line',
    'pre-wrap': 'whitespace-pre-wrap',
  },
  wordBreak: {
    normal: 'break-normal',
    'break-all': 'break-all',
    'break-word': 'break-words',
    'keep-all': 'break-keep',
  },
  overflowWrap: { 'break-word': 'break-words', anywhere: 'break-words' },
  display: {
    block: 'block',
    'inline-block': 'inline-block',
    inline: 'inline',
    flex: 'flex',
    'inline-flex': 'inline-flex',
    grid: 'grid',
    'inline-grid': 'inline-grid',
    contents: 'contents',
    table: 'table',
    none: 'hidden',
  },
  cursor: {
    auto: 'cursor-auto',
    default: 'cursor-default',
    pointer: 'cursor-pointer',
    grab: 'cursor-grab',
    grabbing: 'cursor-grabbing',
    move: 'cursor-move',
    text: 'cursor-text',
    wait: 'cursor-wait',
    help: 'cursor-help',
    'not-allowed': 'cursor-not-allowed',
  },
  position: {
    static: 'static',
    relative: 'relative',
    absolute: 'absolute',
    fixed: 'fixed',
    sticky: 'sticky',
  },
  justifyContent: {
    'flex-start': 'justify-start',
    'flex-end': 'justify-end',
    center: 'justify-center',
    'space-between': 'justify-between',
    'space-around': 'justify-around',
    'space-evenly': 'justify-evenly',
  },
  alignItems: {
    'flex-start': 'items-start',
    'flex-end': 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
  },
  alignSelf: {
    auto: 'self-auto',
    'flex-start': 'self-start',
    'flex-end': 'self-end',
    center: 'self-center',
    baseline: 'self-baseline',
    stretch: 'self-stretch',
  },
  flexDirection: {
    row: 'flex-row',
    'row-reverse': 'flex-row-reverse',
    column: 'flex-col',
    'column-reverse': 'flex-col-reverse',
  },
  flexWrap: {
    wrap: 'flex-wrap',
    nowrap: 'flex-nowrap',
    'wrap-reverse': 'flex-wrap-reverse',
  },
  flex: {
    1: 'flex-1',
    '1 1 auto': 'flex-auto',
    '0 1 auto': 'flex-initial',
    none: 'flex-none',
  },
  overflow: {
    auto: 'overflow-auto',
    hidden: 'overflow-hidden',
    clip: 'overflow-clip',
    visible: 'overflow-visible',
    scroll: 'overflow-scroll',
  },
  overflowX: {
    auto: 'overflow-x-auto',
    hidden: 'overflow-x-hidden',
    clip: 'overflow-x-clip',
    visible: 'overflow-x-visible',
    scroll: 'overflow-x-scroll',
  },
  overflowY: {
    auto: 'overflow-y-auto',
    hidden: 'overflow-y-hidden',
    clip: 'overflow-y-clip',
    visible: 'overflow-y-visible',
    scroll: 'overflow-y-scroll',
  },
  objectFit: {
    contain: 'object-contain',
    cover: 'object-cover',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down',
  },
  pointerEvents: { none: 'pointer-events-none', auto: 'pointer-events-auto' },
  textAlign: {
    left: 'text-start',
    right: 'text-end',
    start: 'text-start',
    end: 'text-end',
    center: 'text-center',
    justify: 'text-justify',
  },
  textTransform: {
    uppercase: 'uppercase',
    lowercase: 'lowercase',
    capitalize: 'capitalize',
    none: 'normal-case',
  },
  fontStyle: { italic: 'italic', normal: 'not-italic' },
  userSelect: {
    none: 'select-none',
    text: 'select-text',
    all: 'select-all',
    auto: 'select-auto',
  },
  touchAction: {
    none: 'touch-none',
    auto: 'touch-auto',
    manipulation: 'touch-manipulation',
    'pan-x': 'touch-pan-x',
    'pan-y': 'touch-pan-y',
  },
  scrollBehavior: { auto: 'scroll-auto', smooth: 'scroll-smooth' },
  visibility: { visible: 'visible', hidden: 'invisible', collapse: 'collapse' },
  boxSizing: { 'border-box': 'box-border', 'content-box': 'box-content' },
  clear: {
    both: 'clear-both',
    left: 'clear-start',
    right: 'clear-end',
    none: 'clear-none',
  },
  float: { left: 'float-start', right: 'float-end', none: 'float-none' },
  listStyleType: {
    none: 'list-none',
    disc: 'list-disc',
    decimal: 'list-decimal',
  },
  gridColumn: { '1 / -1': 'col-span-full' },
  gridRow: { '1 / -1': 'row-span-full' },
};

/**
 * Declarations whose value is a length, mapped to the utility prefix. Logical
 * for the physical sides, as above; `left`/`right` become `start`/`end`.
 */
const LENGTHS = {
  width: 'w',
  height: 'h',
  minWidth: 'min-w',
  maxWidth: 'max-w',
  minHeight: 'min-h',
  maxHeight: 'max-h',
  padding: 'p',
  paddingTop: 'pt',
  paddingBottom: 'pb',
  paddingLeft: 'ps',
  paddingRight: 'pe',
  paddingInline: 'px',
  paddingBlock: 'py',
  margin: 'm',
  marginTop: 'mt',
  marginBottom: 'mb',
  marginLeft: 'ms',
  marginRight: 'me',
  marginInline: 'mx',
  marginBlock: 'my',
  gap: 'gap',
  columnGap: 'gap-x',
  rowGap: 'gap-y',
  top: 'top',
  bottom: 'bottom',
  left: 'start',
  right: 'end',
  inset: 'inset',
  flexBasis: 'basis',
};

/** Keyword values a length utility also accepts, as its suffix. */
const LENGTH_KEYWORDS = {
  auto: 'auto',
  '100%': 'full',
  'max-content': 'max',
  'min-content': 'min',
  'fit-content': 'fit',
  none: 'none',
  '50%': '1/2',
  '25%': '1/4',
  '75%': '3/4',
};

/** Fractions `max-w-*` and `min-w-*` do not have; only `w-*`/`h-*` do. */
const FRACTION_SUFFIXES = new Set(['1/2', '1/4', '3/4']);

/**
 * Prefixes where numeric steps 25, 50, 75 and 100 are ambiguous with percentage
 * values: 100px, 200px, 300px and 400px on these take the arbitrary form instead.
 */
const AMBIGUOUS_STEP_PREFIXES = new Set([
  'w',
  'h',
  'min-w',
  'min-h',
  'top',
  'bottom',
  'start',
  'end',
]);
const AMBIGUOUS_STEPS = new Set([25, 50, 75, 100]);

/**
 * The utility for a length, or `null` when the value is not one.
 *
 * A whole or half step of the 4px scale becomes the scale class, which is
 * root-independent because `--spacing` is pinned to `4px`. Anything else that
 * is still a CSS length — an off-grid px, a viewport or `ch` unit, a
 * percentage with no fraction, a `calc()` — becomes an arbitrary utility,
 * whose spaces have to go (`calc(100vh - 320px)` breaks a class name at the
 * first space, so Tailwind generates nothing for it).
 */
const lengthUtility = (prefix, value) => {
  const keyword = typeof value === 'string' ? LENGTH_KEYWORDS[value] : null;
  if (keyword) {
    if (FRACTION_SUFFIXES.has(keyword) && !/^[wh]$/.test(prefix)) return null;
    if (keyword === 'none' && !prefix.startsWith('max-')) return null;
    return `${prefix}-${keyword}`;
  }

  const px =
    typeof value === 'number'
      ? value
      : /^-?\d+(?:\.\d+)?px$/.test(value)
        ? parseFloat(value)
        : null;
  if (px !== null) {
    // A whole or half step: `minWidth: 90` is `min-w-22.5`, `padding: 16` is
    // `p-4`. An off-grid value (17px) is named arbitrary instead, so choosing
    // 16 or 20 stays a decision someone makes.
    if (px === 0) return `${prefix}-0`;
    if (Number.isInteger(px) && px % 2 === 0) {
      const steps = Math.abs(px) / 4;
      if (!(
        AMBIGUOUS_STEP_PREFIXES.has(prefix) && AMBIGUOUS_STEPS.has(steps)
      )) {
        // Tailwind spells a negative step with a leading dash on the utility,
        // `-mb-0.5`, not `mb--0.5`.
        return px < 0 ? `-${prefix}-${steps}` : `${prefix}-${steps}`;
      }
    }
    return `${prefix}-[${px}px]`;
  }

  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  // A length we can pass through verbatim, with calc()'s spaces removed.
  if (
    /^-?\d+(?:\.\d+)?(?:%|px|r?em|v[hw]|vmin|vmax|ch|ex|pt|cm|mm|in)$/.test(
      trimmed,
    )
  ) {
    return `${prefix}-[${trimmed}]`;
  }
  if (/^calc\([^;{}]*\)$/.test(trimmed)) {
    return `${prefix}-[${trimmed.replace(/\s+/g, '')}]`;
  }
  return null;
};

/** The utility a static declaration has, or `null` when it has none. */
export const utilityFor = (property, value) => {
  if (KEYWORDS[property]) {
    const key = typeof value === 'number' ? String(value) : value;
    return KEYWORDS[property][key] ?? null;
  }
  if (LENGTHS[property]) return lengthUtility(LENGTHS[property], value);
  return null;
};

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Set a static declaration with a Tailwind utility, not an inline style, which outranks every stylesheet',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      prefer:
        'Every value of this inline `{{ property }}` is a literal, so it is a class in disguise: use "{{ utility }}" in className instead. An inline style outranks every stylesheet, so it also opts this element out of dark mode, responsive variants and the token scales.',
    },
  },

  create(context) {
    return {
      Property(node) {
        const property = styleKeyName(node);
        if (!property || !inJsxStyle(node)) return;
        if (styleObjectHasSpread(node)) return;
        const value = staticStyleValue(node);
        if (value === null) return;
        const utility = utilityFor(property, value);
        if (!utility) return;
        context.report({
          node,
          messageId: 'prefer',
          data: { property, utility },
        });
      },
    };
  },
};
