import { afterEach, describe, expect, it } from 'vitest';

import { DEFAULT_PRIMARY_COLORS } from 'waldur-design-tokens';

import { getMermaidThemeVariables } from './mermaidTheme';

const root = document.documentElement;

afterEach(() => root.removeAttribute('style'));

// Which default-ramp step each brand-derived variable reads, per theme. Dark
// mode takes the mirrored step (light 100 is dark 800, and so on).
const STEPS = {
  light: {
    primaryColor: 100,
    primaryBorderColor: 400,
    secondaryColor: 50,
    secondaryBorderColor: 200,
    clusterBorder: 300,
  },
  dark: {
    primaryColor: 800,
    primaryBorderColor: 500,
    secondaryColor: 900,
    secondaryBorderColor: 700,
    clusterBorder: 600,
  },
} as const;

describe('brand colours in the Mermaid theme', () => {
  describe.each([false, true])('dark: %s', (isDark) => {
    const steps = STEPS[isDark ? 'dark' : 'light'];

    it('use the default ramp when no brand colour is set', () => {
      const vars = getMermaidThemeVariables(isDark) as unknown as Record<
        string,
        string
      >;
      for (const [key, step] of Object.entries(steps)) {
        expect(vars[key], key).toBe(DEFAULT_PRIMARY_COLORS[step]);
      }
    });

    it('follow the tenant brand ramp when it is set', () => {
      for (const step of Object.values(steps)) {
        root.style.setProperty(`--waldur-brand-${step}`, `#00${step % 100}00`);
      }
      const vars = getMermaidThemeVariables(isDark) as unknown as Record<
        string,
        string
      >;
      for (const [key, step] of Object.entries(steps)) {
        expect(vars[key], key).toBe(`#00${step % 100}00`);
      }
    });
  });
});
