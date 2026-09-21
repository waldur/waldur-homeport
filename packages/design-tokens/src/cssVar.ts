import { DEFAULT_PRIMARY_COLORS } from './brandColors';

/**
 * Resolved value of a CSS custom property, trimmed, read from <html> (where
 * both the theme stylesheets and initBrandTokens() put their variables).
 *
 * Returns `fallback` when the property is unset or empty, and when there is no
 * DOM. Use it for consumers that cannot take `var(--x)` directly, such as a
 * canvas chart. The value is a snapshot: re-read it when the theme or the
 * brand colour changes (React code can use `useResolvedVar` from
 * `waldur-design-tokens/react`, which does).
 */
export function getCssVar(name: string, fallback = ''): string {
  if (typeof document === 'undefined') {
    return fallback;
  }
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

/** A step of the brand ramp (25, 50, 100 ... 950). */
export type BrandStep = keyof typeof DEFAULT_PRIMARY_COLORS;

/**
 * `--waldur-brand-<step>`, the tenant's brand ramp that initBrandTokens() writes
 * to <html> at bootstrap. Falls back to the same step of the default green
 * ramp when the variable is not there (a test, a page that never ran the
 * bootstrap), so callers do not need a hex copy of their own.
 */
export function getBrandVar(step: BrandStep): string {
  return getCssVar(`--waldur-brand-${step}`, DEFAULT_PRIMARY_COLORS[step]);
}
