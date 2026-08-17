import { generateBrandColors } from './brandColors';
import { hexToRgb } from './colorMath';

/**
 * Sets --waldur-brand-* CSS custom properties on `target` from a single
 * brand color. Takes the color as a plain argument rather than reading it
 * from any config source itself — callers (the main app, or a microapp)
 * each decide where their brand color comes from and stay the single
 * source of truth for that; this only owns the ramp math and the DOM
 * writes, so it's never duplicated between consumers.
 */
export function initBrandTokens(
  brandColor: string,
  target: HTMLElement = document.documentElement,
) {
  target.style.setProperty('--waldur-brand-color', brandColor);
  target.style.setProperty('--waldur-brand-color-rgb', hexToRgb(brandColor));

  const brandColors = generateBrandColors(brandColor);
  Object.entries(brandColors).forEach(([key, color]) => {
    target.style.setProperty(`--waldur-brand-${key}`, color);
  });
}
