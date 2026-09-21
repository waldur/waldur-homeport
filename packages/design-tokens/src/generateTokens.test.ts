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
      },
    };
    expect(generateScss(t)).not.toContain('$pink-400');
    expect(generateCss(t)).toContain('--color-pink-400: #f670c7;');
  });

  it('keeps a CSS-only ramp out of the SCSS and emits it as a plain ramp', () => {
    const t = {
      ramps: {
        'gray-dark': {
          scss: false,
          steps: { '900': { light: '#161b26' } },
        },
      },
    };
    expect(generateScss(t)).not.toContain('gray-dark');
    expect(generateCss(t)).toContain('--color-gray-dark-900: #161b26;');
  });

  it('never emits a per-theme override block', () => {
    expect(generateCss(readTokens())).not.toMatch(/data-theme/);
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
