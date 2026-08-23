export type ThemeName = 'light' | 'dark';

/**
 * The exact key waldur-homeport's own src/theme/ThemeStorage.ts writes to
 * — not namespaced, same reasoning as the shared `waldur/auth/*` keys a
 * microapp's own auth-core config reads: a user's theme choice in the main
 * app should carry over here too, not reset to a second independent
 * toggle.
 */
const THEME_STORAGE_KEY = 'waldur/theme/name';

/**
 * Same resolution order as the main app's getInitialTheme() (see
 * src/theme/utils.ts): stored preference, then prefers-color-scheme, then
 * light. Deliberately doesn't check the main app's
 * ENV.plugins.WALDUR_CORE.DISABLE_DARK_THEME feature flag — a microapp has
 * no runtime-config plugins wiring for it yet, and it's a rarely-touched
 * org-level toggle, not a correctness issue, to skip for now.
 */
export function getInitialTheme(): ThemeName {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function setStoredTheme(theme: ThemeName) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

/**
 * Mirrors `theme` onto `target`'s data-theme attribute — the same signal
 * the main app's loadTheme() sets on <html> (see src/theme/utils.ts),
 * which colors.css/buttonColors.css/surfaceColors.css already key off via
 * `:root[data-theme='dark']`. Unlike loadTheme(), there's no separate
 * Metronic stylesheet to swap here — Tailwind's tokens read this
 * attribute directly, no JS-driven CSS swap needed.
 */
export function applyTheme(
  theme: ThemeName,
  target: HTMLElement = document.documentElement,
) {
  target.setAttribute('data-theme', theme);
}
