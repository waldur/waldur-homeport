import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  generateAll,
  generateCss,
  generateScss,
  readTokens,
  repoRoot,
} from '../scripts/generate-tokens.mjs';

/**
 * The SCSS and CSS ramps are generated from tokens/colors.json. Committing an
 * edit to the JSON (or to the generator) without regenerating leaves the
 * outputs stale, and committing an edit to an output leaves it disagreeing
 * with the JSON — both fail here, with the fix in the message.
 */
describe('generated colour tokens', () => {
  it.each(Object.entries(generateAll()))(
    'is up to date: %s',
    (file, expected) => {
      const actual = readFileSync(file, 'utf8');
      expect(
        actual,
        `${path.relative(repoRoot, file)} is stale — run \`yarn tokens:generate\``,
      ).toBe(expected);
    },
  );
});

describe('generator', () => {
  const tokens = (steps: Record<string, unknown>, extra = {}) => ({
    ramps: {
      gray: { steps, ...extra },
    },
  });
  const fullGray = Object.fromEntries(
    [
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
    ].map((step, i) => [
      step,
      { light: `#00000${i.toString(16)}`, dark: `#11111${i.toString(16)}` },
    ]),
  );

  it('emits a plain value when a step is the same in both themes', () => {
    const scss = generateScss({
      ramps: { pink: { steps: { '950': { light: '#4e0d30' } } } },
    });
    expect(scss).toContain('$pink-950: #4e0d30 !default;');
  });

  it('emits if(isDarkMode()) with dark first for a themed step', () => {
    const scss = generateScss(
      tokens({ '50': { light: '#f9fafb', dark: '#161b26' } }),
    );
    expect(scss).toContain(
      '$gray-50: if(isDarkMode(), #161b26, #f9fafb) !default;',
    );
  });

  it('honours scssName, scssDefault and css: false', () => {
    const t = {
      ramps: {
        error: {
          scssName: 'danger',
          steps: { '50': { light: '#fef3f2', dark: '#7a271a' } },
        },
        primary: {
          css: false,
          scssDefault: false,
          steps: { '50': { light: '#f1f7ef', dark: '#174000' } },
        },
        gray: { steps: fullGray },
      },
    };
    expect(generateScss(t)).toContain(
      '$danger-50: if(isDarkMode(), #7a271a, #fef3f2) !default;',
    );
    expect(generateScss(t)).toContain(
      '$primary-50: if(isDarkMode(), #174000, #f1f7ef);',
    );
    expect(generateCss(t)).toContain('--color-error-50: #fef3f2;');
    expect(generateCss(t)).not.toContain('--color-primary');
  });

  it('keeps a CSS-only step out of the SCSS', () => {
    const t = {
      ramps: {
        pink: { steps: { '400': { light: '#f670c7', scss: false } } },
        gray: { steps: fullGray },
      },
    };
    expect(generateScss(t)).not.toContain('$pink-400');
    expect(generateCss(t)).toContain('--color-pink-400: #f670c7;');
  });

  it('mirrors the SCSS dark gray into the CSS dark block', () => {
    const css = generateCss(tokens(fullGray));
    // fullGray's dark values are #111110 (step 25) .. #11111b (step 950), so
    // CSS step 25 takes the dark value of SCSS step 950, and vice versa.
    expect(css).toContain('--color-gray-25: #11111b;');
    expect(css).toContain('--color-gray-950: #111110;');
  });

  it('rejects a redundant dark value and non-canonical colours', () => {
    expect(() =>
      generateScss(tokens({ '50': { light: '#f9fafb', dark: '#f9fafb' } })),
    ).toThrow(/drop "dark"/);
    expect(() => generateScss(tokens({ '50': { light: '#F9FAFB' } }))).toThrow(
      /lower-case #rrggbb/,
    );
  });

  it('has the ramps and steps the app relies on', () => {
    const { ramps } = readTokens();
    expect(Object.keys(ramps)).toEqual(
      expect.arrayContaining(['gray', 'error', 'warning', 'success', 'info']),
    );
    expect(Object.keys(ramps.gray.steps)).toHaveLength(12);
  });
});
