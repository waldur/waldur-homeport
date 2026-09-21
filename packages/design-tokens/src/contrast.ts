/**
 * WCAG contrast and colour parsing, with no DOM and no dependencies, so the
 * same code serves a unit test, a story and a Playwright spec.
 */

/** Red, green and blue as 0-255. */
export type Rgb = [number, number, number];

/**
 * A colour as [r, g, b]: `#rgb`, `#rrggbb`, or the `rgb(...)` / `rgba(...)`
 * form that getComputedStyle() returns (the alpha is ignored). Null for
 * anything else, including a named colour.
 */
export function parseColor(value: string): Rgb | null {
  const text = value.trim();

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
  if (hex) {
    const digits =
      hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join('') : hex[1];
    return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16)) as Rgb;
  }

  if (/^rgba?\(/i.test(text)) {
    const parts = text.match(/[\d.]+/g);
    if (parts && parts.length >= 3) {
      return parts.slice(0, 3).map(Number) as Rgb;
    }
  }
  return null;
}

/**
 * Relative luminance, 0 (black) to 1 (white). Uses WCAG 2.x's 0.03928
 * threshold rather than sRGB's 0.04045; the difference does not reach a
 * ratio's second decimal.
 */
export function relativeLuminance([r, g, b]: Rgb): number {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

const toRgb = (color: Rgb | string): Rgb => {
  const rgb = typeof color === 'string' ? parseColor(color) : color;
  if (!rgb) {
    throw new Error(`Not a colour: ${String(color)}`);
  }
  return rgb;
};

/** WCAG contrast ratio, 1 to 21, whichever colour is the lighter. */
export function contrastRatio(a: Rgb | string, b: Rgb | string): number {
  const [lighter, darker] = [
    relativeLuminance(toRgb(a)),
    relativeLuminance(toRgb(b)),
  ].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * `#fff` or `#000`, whichever has the higher contrast on `color`; null when
 * `color` cannot be parsed, so the caller decides what to fall back to.
 */
export function readableOn(color: string): '#fff' | '#000' | null {
  const rgb = parseColor(color);
  if (!rgb) {
    return null;
  }
  return contrastRatio('#ffffff', rgb) > contrastRatio('#000000', rgb)
    ? '#fff'
    : '#000';
}
