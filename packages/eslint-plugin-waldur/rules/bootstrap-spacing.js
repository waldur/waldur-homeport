/**
 * Bootstrap's spacing utilities (margin, padding, gap) on Tailwind's scale.
 *
 * Bootstrap and Tailwind use the same names (`mb-4`, `p-3`, `gap-2`) for
 * different values. Bootstrap's $spacers are rem against the 13px root and
 * step 4 is irregular; Tailwind's spacing unit is a fixed 4px
 * (primitives/spacing.css in waldur-design-tokens). Each Bootstrap
 * step maps to the nearest half step of Tailwind's scale (#477).
 *
 * Shared by scripts/codemods/bootstrap-spacing.mjs, which rewrites a family
 * when _utilities.scss stops generating it, and by
 * no-retired-bootstrap-utility, which reports the spellings only Bootstrap
 * had (`mb-md-4`, `mt-n2`, `gap-8px`) once their family is retired.
 */

/**
 * Bootstrap's $spacers (_variables.scss) at the 13px root, as the nearest
 * half step of Tailwind's 4px spacing unit.
 * src/tailwindBootstrapSpacing.test.ts checks every entry against the
 * compiled map.
 */
export const SPACER_TO_TAILWIND = {
  0: '0', // 0
  1: '1', // 3.25px → 4px
  2: '1.5', // 6.5px → 6px
  3: '2.5', // 9.75px → 10px
  4: '3', // 12px
  5: '4', // 16.25px → 16px
  6: '5', // 20px
  7: '5.5', // 22px
  8: '6', // 24px
  9: '7.5', // 29.25px → 30px
  10: '8', // 32.5px → 32px
  11: '9', // 35.75px → 36px
  12: '10', // 39px → 40px
  13: '10.5', // 42.25px → 42px
  14: '11.5', // 45.5px → 46px
  15: '12', // 48.75px → 48px
  16: '13', // 52px
  17: '14', // 55.25px → 56px
  18: '14.5', // 58.5px → 58px
  19: '15.5', // 61.75px → 62px
  20: '16', // 65px → 64px
  '2px': '0.5',
  '4px': '1',
  '6px': '1.5',
  '8px': '2',
  '10px': '2.5',
  '12px': '3',
};

/** Bootstrap's class prefix for each spacing family. */
export const SPACING_FAMILIES = [
  'm',
  'mt',
  'mb',
  'ms',
  'me',
  'mx',
  'my',
  'p',
  'pt',
  'pb',
  'ps',
  'pe',
  'px',
  'py',
  'gap',
];

/**
 * The families _utilities.scss no longer generates: all of them, so their
 * names are Tailwind's. src/tailwindBootstrapSpacing.test.ts checks
 * Bootstrap emits none of them.
 */
export const RETIRED_SPACING_FAMILIES = SPACING_FAMILIES;

const BREAKPOINTS = { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl', xxl: '2xl' };

const SPACING_TOKEN =
  /^(m|mt|mb|ms|me|mx|my|p|pt|pb|ps|pe|px|py|gap)-(?:(sm|md|lg|xl|xxl)-)?(n?)(\d+px|\d+|auto)$/;

/**
 * The Tailwind class for a Bootstrap spacing class of one of `families`, or
 * null when the token is not one: `mb-md-4` → `md:mb-3`, `mt-n2` → `-mt-1.5`.
 */
export const toTailwindSpacing = (token, families = SPACING_FAMILIES) => {
  const m = SPACING_TOKEN.exec(token);
  if (!m) return null;
  const [, family, bp, negative, step] = m;
  if (!families.includes(family)) return null;
  const isMargin = family.startsWith('m');
  // `pe-auto` / `pe-none` are Bootstrap's pointer-events, not padding.
  if (step === 'auto' && (!isMargin || negative)) return null;
  if (negative && (!isMargin || step === '0')) return null;
  const value = step === 'auto' ? 'auto' : SPACER_TO_TAILWIND[step];
  if (value === undefined) return null;
  const prefix = bp ? `${BREAKPOINTS[bp]}:` : '';
  return `${prefix}${negative ? '-' : ''}${family}-${value}`;
};

/**
 * True for a spelling Tailwind does not have: a breakpoint infix
 * (`mb-md-4`), a negative `n` step (`mt-n2`) or a pixel step (`gap-8px`).
 */
export const isBootstrapOnlySpacing = (token) => {
  const m = SPACING_TOKEN.exec(token);
  return Boolean(m && (m[2] || m[3] || m[4].endsWith('px')));
};
