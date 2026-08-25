/**
 * Loads one of the shared translation catalogs at the repo root's
 * `locales/*.json` (waldur-homeport's own src/i18n/LanguageUtilsService.ts
 * and every micro-app previously each defined their own copy of this exact
 * function, differing only in how many `../` reached the repo root from
 * that file's own location — a real, previously-unnoticed duplication:
 * apps/micro-app-poc/src/App.tsx's copy used `../../../locales/...` (one
 * level deeper than the main app's `../../locales/...`), and every future
 * micro-app would need its own correctly-counted copy).
 *
 * Centralizing it here works without any Vite alias or per-app config:
 * `import()` with a template literal is resolved by Vite relative to the
 * file the expression is written in, not the file that calls the
 * function wrapping it — so as long as this file's own location relative
 * to locales/ is fixed (packages/i18n-runtime/src/ -> ../../../locales/,
 * true regardless of which app's build processes this package's source),
 * every consumer gets a correct path for free, with zero config of its
 * own. Matches LanguageUtilsConfig['loadLocale']'s exact signature.
 */
export function loadSharedLocale(
  locale: string,
): Promise<{ default: Record<string, string> }> {
  return import(`../../../locales/${locale}.json`);
}
