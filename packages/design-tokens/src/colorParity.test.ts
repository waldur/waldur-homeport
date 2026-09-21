import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * The colour ramps exist twice: as SCSS variables in
 * src/metronic/sass/_colors.scss (what Bootstrap/Metronic actually render,
 * with `isDarkMode()` resolved at compile time) and as CSS custom properties
 * in colors.css (what Tailwind components read). Nothing links them, so they
 * drifted once already (success-25/100/200). This test is the link: it fails
 * when a value is edited on one side only.
 *
 * It parses the files as text on purpose — there is no build step to import
 * from, and a regex over `$name-N: if(isDarkMode(), dark, light)` is enough.
 */

const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');

const scss = read('../../../src/metronic/sass/_colors.scss');
const css = read('./colors.css');

// The two spellings differ for exactly one ramp.
const SCSS_NAME: Record<string, string> = { error: 'danger' };

const STEPS = [
  '25',
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  '950',
];
const mirror = (step: string) => STEPS[STEPS.length - 1 - STEPS.indexOf(step)];

/** `$danger-500` -> { light, dark }; a plain `$x: #hex` is the same in both. */
const parseScss = () => {
  const ramps = new Map<string, { light: string; dark: string }>();
  for (const m of scss.matchAll(
    /\$([a-z]+-\d+):\s*if\(\s*isDarkMode\(\),\s*(#[0-9a-f]+),\s*(#[0-9a-f]+)\s*\)/gi,
  )) {
    ramps.set(m[1], { dark: m[2].toLowerCase(), light: m[3].toLowerCase() });
  }
  for (const m of scss.matchAll(/^\$([a-z]+-\d+):\s*(#[0-9a-f]+)/gim)) {
    const hex = m[2].toLowerCase();
    if (!ramps.has(m[1])) {
      ramps.set(m[1], { dark: hex, light: hex });
    }
  }
  return ramps;
};

/** `--color-error-500: #f04438;` -> Map('error-500' -> '#f04438'). */
const parseCssBlock = (block: string) => {
  const out = new Map<string, string>();
  for (const m of block.matchAll(/--color-([a-z]+-\d+):\s*(#[0-9a-f]+);/gi)) {
    out.set(m[1], m[2].toLowerCase());
  }
  return out;
};

const darkStart = css.indexOf(":root[data-theme='dark']");
const lightCss = parseCssBlock(css.slice(0, darkStart));
const darkCss = parseCssBlock(
  css.slice(darkStart, css.indexOf('@theme', darkStart)),
);
const scssRamps = parseScss();
const toScssKey = (cssKey: string) => {
  const [name, step] = cssKey.split('-');
  return `${SCSS_NAME[name] ?? name}-${step}`;
};

// Steps colors.css carries that Metronic never defines (the SCSS ramps for
// these hues are sparser). Listed explicitly so the list can't quietly rot:
// the test below asserts each one really is absent from the SCSS.
const CSS_ONLY_STEPS = [
  'purple-400',
  'moss-400',
  'pink-400',
  'orange-400',
  'rose-400',
];

describe('colors.css ↔ _colors.scss parity', () => {
  it('finds the ramps it is supposed to compare', () => {
    expect(lightCss.size).toBeGreaterThan(100);
    expect(scssRamps.size).toBeGreaterThan(100);
  });

  it('keeps every light value equal to what the app renders', () => {
    const drift: string[] = [];
    for (const [key, value] of lightCss) {
      if (CSS_ONLY_STEPS.includes(key)) {
        continue;
      }
      const scssValue = scssRamps.get(toScssKey(key))?.light;
      if (scssValue === undefined) {
        drift.push(`--color-${key}: missing in _colors.scss`);
      } else if (scssValue !== value) {
        drift.push(`--color-${key}: css ${value} != scss ${scssValue}`);
      }
    }
    expect(drift).toEqual([]);
  });

  it('keeps the CSS-only allowlist honest', () => {
    for (const key of CSS_ONLY_STEPS) {
      expect(lightCss.has(key)).toBe(true);
      expect(scssRamps.has(toScssKey(key))).toBe(false);
    }
  });

  // Only gray has a distinct dark ramp in colors.css. It is stored with
  // physical lightness (gray-900 is dark in both themes), while the SCSS
  // `$gray-N` is theme-inverted (`$gray-900` is light in dark mode) — so the
  // same step name means opposite things, and the two ramps line up only
  // through the mirrored step. That is also why Tailwind's `bg-gray-50` and
  // Metronic's `.bg-gray-50` disagree in dark mode.
  it('keeps the dark gray ramp equal to the mirrored SCSS dark gray', () => {
    const drift: string[] = [];
    for (const step of STEPS) {
      const cssValue = darkCss.get(`gray-${step}`);
      const scssValue = scssRamps.get(`gray-${mirror(step)}`)?.dark;
      if (cssValue !== scssValue) {
        drift.push(
          `--color-gray-${step}: css ${cssValue} != scss $gray-${mirror(step)} ${scssValue}`,
        );
      }
    }
    expect(drift).toEqual([]);
  });
});
