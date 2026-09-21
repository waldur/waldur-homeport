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
