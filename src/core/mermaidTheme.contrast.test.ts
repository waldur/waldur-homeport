import { describe, expect, it, vi } from 'vitest';

import { contrastRatio } from 'waldur-design-tokens';

import tokens from '../../packages/design-tokens/tokens/colors.json';

const state = vi.hoisted(() => ({ dark: false }));

// Resolve variables the way the page does, from the token data, so the test
// sees the real colours: --color-gray-N / --color-gray-dark-N, the card surface
// and the default brand ramp (through getBrandVar).
vi.mock('waldur-design-tokens', async () => {
  const actual = await vi.importActual<typeof import('waldur-design-tokens')>(
    'waldur-design-tokens',
  );
  const ramp = (name: 'gray' | 'gray-dark', step: string) =>
    (tokens.ramps[name].steps as Record<string, { light: string }>)[step]
      ?.light;
  return {
    ...actual,
    getCssVar: (name: string, fallback = '') => {
      const gray = /^--color-gray-(dark-)?(\d+)$/.exec(name);
      if (gray) {
        return ramp(gray[1] ? 'gray-dark' : 'gray', gray[2]) ?? fallback;
      }
      if (name === '--surface-card-bg') {
        return state.dark ? ramp('gray-dark', '900') : '#ffffff';
      }
      return fallback;
    },
    // No tenant brand colour is set here, so the default ramp applies.
    getBrandVar: (step: keyof typeof actual.DEFAULT_PRIMARY_COLORS) =>
      actual.DEFAULT_PRIMARY_COLORS[step],
  };
});

import { getMermaidThemeVariables } from './mermaidTheme';

// Text on the fill it is drawn on. Dark mode once had near-black labels on dark
// green nodes (1.4:1); this is the check that would have caught it.
const PAIRS: [text: string, fill: string][] = [
  ['primaryTextColor', 'primaryColor'],
  ['secondaryTextColor', 'secondaryColor'],
  ['tertiaryTextColor', 'tertiaryColor'],
  ['noteTextColor', 'noteBkgColor'],
  ['textColor', 'background'],
];

describe('mermaid theme contrast', () => {
  describe.each([false, true])('dark: %s', (isDark) => {
    it.each(PAIRS)('%s on %s is at least 4.5:1', (textKey, fillKey) => {
      state.dark = isDark;
      const vars = getMermaidThemeVariables(isDark) as unknown as Record<
        string,
        string
      >;
      const ratio = contrastRatio(vars[textKey], vars[fillKey]);
      expect(
        ratio,
        `${textKey} ${vars[textKey]} on ${fillKey} ${vars[fillKey]}`,
      ).toBeGreaterThanOrEqual(4.5);
    });
  });
});
