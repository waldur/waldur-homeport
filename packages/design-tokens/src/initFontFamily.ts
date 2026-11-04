/**
 * Sets --font-family on `target` — the same runtime-injected CSS
 * custom property waldur-homeport's own src/afterBootstrap.tsx's
 * initCssVariables() sets from a tenant-configurable
 * ENV.plugins.WALDUR_CORE.FONT_FAMILY. Takes the resolved font name as a
 * plain argument rather than reading any config source itself — same
 * reasoning as initBrandTokens(): callers decide where their font choice
 * comes from (a live fetchRuntimeConfig() plugin value, a hardcoded
 * default, or both in sequence) and stay the single source of truth for
 * that.
 *
 * The font's glyph size needs no per-font setting: font-size-adjust in
 * primitives/typography.css matches every font's x-height to Inter's.
 */
export function initFontFamily(
  fontFamily: string,
  target: HTMLElement = document.documentElement,
) {
  target.style.setProperty(
    '--font-family',
    `${fontFamily}, Helvetica, sans-serif`,
  );
}
