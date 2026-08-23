/**
 * Sets --waldur-font-family on `target` — the same runtime-injected CSS
 * custom property waldur-homeport's own src/afterBootstrap.tsx's
 * initCssVariables() sets from a tenant-configurable
 * ENV.plugins.WALDUR_CORE.FONT_FAMILY. Takes the resolved font name as a
 * plain argument rather than reading any config source itself — same
 * reasoning as initBrandTokens(): callers decide where their font choice
 * comes from (a live fetchRuntimeConfig() plugin value, a hardcoded
 * default, or both in sequence) and stay the single source of truth for
 * that.
 *
 * Doesn't port --waldur-font-size-adjust (afterBootstrap.tsx's other
 * font-related variable) — that one only compensates Metronic's own
 * 13px-root-based heading sizes for fonts like "Maven Pro" that render
 * visually larger at the same px size
 * (src/metronic/sass/core/layout/_base.scss); nothing outside Metronic
 * consumes it, so there's nothing for it to do here.
 */
export function initFontFamily(
  fontFamily: string,
  target: HTMLElement = document.documentElement,
) {
  target.style.setProperty(
    '--waldur-font-family',
    `${fontFamily}, Helvetica, sans-serif`,
  );
}
