import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * The colour ramps exist twice: as SCSS variables in
 * src/metronic/sass/_color-ramps.scss (what Bootstrap/Metronic render) and as
 * CSS custom properties in colorRamps.css (what Tailwind components read).
 * Both are generated from tokens/colors.json, and generateTokens.test.ts
 * fails when either is stale — so this test checks the data and the
 * generator: that the two outputs really agree, step by step.
 * (It read hand-written files before, and caught success-25/100/200 drifting.)
 *
 * It parses the files as text on purpose — there is no build step to import
 * from, and a regex over `$name-N: #hex` is enough.
 */

const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');

const scss = read('../../../src/metronic/sass/_color-ramps.scss');
const css = read('./css/primitives/colorRamps.css');

// The two spellings differ for exactly one ramp.
const SCSS_NAME: Record<string, string> = { error: 'danger' };

/** `$danger-500: #f04438 !default;` -> Map('danger-500' -> '#f04438'). */
const parseScss = () => {
  const ramps = new Map<string, string>();
  for (const m of scss.matchAll(/^\$([a-z]+-\d+):\s*(#[0-9a-f]+)/gim)) {
    ramps.set(m[1], m[2].toLowerCase());
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

const lightCss = parseCssBlock(css);
const scssRamps = parseScss();
const toScssKey = (cssKey: string) => {
  const [name, step] = cssKey.split('-');
  return `${SCSS_NAME[name] ?? name}-${step}`;
};

// Steps colorRamps.css carries that Metronic never defines (the SCSS ramps for
// these hues are sparser). Listed explicitly so the list can't quietly rot:
// the test below asserts each one really is absent from the SCSS.
const CSS_ONLY_STEPS = [
  'purple-400',
  'moss-400',
  'pink-400',
  'orange-400',
  'rose-400',
];

describe('colorRamps.css ↔ _color-ramps.scss parity', () => {
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
      const scssValue = scssRamps.get(toScssKey(key));
      if (scssValue === undefined) {
        drift.push(`--color-${key}: missing in _color-ramps.scss`);
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

  it('does not override any ramp per theme', () => {
    // A per-theme override of --color-gray-N is what gray-dark replaced.
    expect(css).not.toMatch(/data-theme/);
  });
});
