import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  generateAll,
  generateCss,
  readTokens,
  repoRoot,
} from '../scripts/generate-tokens.mjs';

/**
 * The CSS ramps are generated from tokens/colors.json. Committing an
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
  it('emits each step as its value: the ramps are not themed', () => {
    const css = generateCss({
      ramps: { pink: { steps: { '950': { light: '#4e0d30' } } } },
    });
    expect(css).toContain('--color-pink-950: #4e0d30;');
  });

  it('honours css: false', () => {
    const t = {
      ramps: {
        error: { steps: { '50': { light: '#fef3f2' } } },
        primary: { css: false, steps: { '50': { light: '#f1f7ef' } } },
      },
    };
    expect(generateCss(t)).toContain('--color-error-50: #fef3f2;');
    expect(generateCss(t)).not.toContain('--color-primary');
  });

  it('never emits a per-theme override block', () => {
    expect(generateCss(readTokens())).not.toMatch(/data-theme/);
  });

  // One stylesheet serves both themes: dark UI picks other steps through the
  // semantic tokens, so a ramp step has a single value.
  it('rejects a dark value and non-canonical colours', () => {
    expect(() =>
      generateCss(tokens({ '50': { light: '#f9fafb', dark: '#161b26' } })),
    ).toThrow(/no "dark" value/);
    expect(() => generateCss(tokens({ '50': { light: '#F9FAFB' } }))).toThrow(
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
