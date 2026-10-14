import { generateBrandColors } from './brandColors';
import { hexToRgb } from './colorMath';

/**
 * Sets --brand-* CSS custom properties on `target` from a single
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
  const brandColorRgb = hexToRgb(brandColor);
  target.style.setProperty('--brand-color', brandColor);
  target.style.setProperty('--brand-color-rgb', brandColorRgb);

  const brandColors = generateBrandColors(brandColor);
  Object.entries(brandColors).forEach(([key, color]) => {
    target.style.setProperty(`--brand-${key}`, color);
    target.style.setProperty(`--brand-${key}-rgb`, hexToRgb(color));
  });
}
