import { describe, expect, it, vi } from 'vitest';

// Every variable resolves to its own name, so a colour that did not come from
// the theme (a hex literal) stands out.
vi.mock('waldur-design-tokens', () => ({
  getCssVar: (name: string) => name,
  getBrandVar: (step: number) => `--waldur-brand-${step}`,
}));

import { getMermaidThemeVariables } from './mermaidTheme';

const colours = (isDark: boolean) =>
  Object.entries(getMermaidThemeVariables(isDark)).filter(
    ([key]) => key !== 'darkMode' && key !== 'fontFamily',
  ) as [string, string][];

describe('getMermaidThemeVariables', () => {
  it.each([false, true])(
    'takes every colour from the theme variables (dark: %s)',
    (isDark) => {
      for (const [key, value] of colours(isDark)) {
        expect(value, key).toMatch(/^--/);
      }
    },
  );

  it('reads gray for light UI and gray-dark for dark UI', () => {
    const grays = (isDark: boolean) =>
      colours(isDark)
        .map(([, value]) => value)
        .filter((value) => value.startsWith('--color-gray'));
    expect(grays(false).length).toBeGreaterThan(0);
    expect(grays(false).every((v) => /^--color-gray-\d+$/.test(v))).toBe(true);
    expect(grays(true).every((v) => /^--color-gray-dark-\d+$/.test(v))).toBe(
      true,
    );
  });

  it('takes the background from the card surface in both themes', () => {
    expect(getMermaidThemeVariables(false).background).toBe(
      '--surface-card-bg',
    );
    expect(getMermaidThemeVariables(true).background).toBe('--surface-card-bg');
  });

  it('flags the dark theme', () => {
    expect(getMermaidThemeVariables(true).darkMode).toBe(true);
    expect(getMermaidThemeVariables(false).darkMode).toBe(false);
  });
});
