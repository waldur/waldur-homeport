import { describe, expect, it } from 'vitest';

import { contrastRatio } from './contrast';
import { resolveToken } from './themeTokens';

/**
 * Every BaseButton variant's text against its own fill, in each state a
 * pointer or keyboard can hold it in, must reach WCAG AA for normal text
 * (4.5:1) in both themes. The tokens are read from css/components/button.css
 * as text and resolved against the generated ramps (and the default brand
 * ramp), so a token edit that drops a pair below AA fails here before an
 * axe scan of a real page finds it. Disabled buttons are exempt (WCAG
 * 1.4.3 does not cover inactive controls) and are not checked.
 */

// [label, background token or 'card', text token]
const PAIRS: [string, string, string][] = [
  ['primary', '--btn-primary-bg', '--btn-primary-text'],
  ['primary hover', '--btn-primary-bg-hover', '--btn-primary-text'],
  ['secondary', '--btn-secondary-bg', '--btn-secondary-text'],
  ['tertiary', '--btn-tertiary-bg', '--btn-tertiary-text'],
  ['tertiary hover', '--btn-tertiary-bg-hover', '--btn-tertiary-text'],
  ['tertiary-ghost', 'card', '--btn-tertiary-text'],
  ['text-primary', 'card', '--btn-text-primary-color'],
  ['text-secondary', 'card', '--btn-text-secondary-color'],
  ['text-danger', 'card', '--btn-text-danger-color'],
  ['text-warning', 'card', '--btn-text-warning-color'],
  ['text-success', 'card', '--btn-text-success-color'],
  ...(['danger', 'warning', 'success'] as const).flatMap(
    (variant): [string, string, string][] => [
      [variant, `--btn-${variant}-bg`, `--btn-${variant}-text`],
      [
        `${variant} hover`,
        `--btn-${variant}-bg-hover`,
        `--btn-${variant}-text`,
      ],
      [
        `${variant} pressed`,
        `--btn-${variant}-bg-pressed`,
        '--btn-pressed-text-on-vivid',
      ],
    ],
  ),
];

describe('BaseButton colour tokens', () => {
  for (const theme of ['light', 'dark'] as const) {
    it.each(PAIRS)(`${theme}: %s text reaches 4.5:1`, (_, bg, text) => {
      const background = resolveToken(bg === 'card' ? '--card-bg' : bg, theme);
      const foreground = resolveToken(text, theme);
      expect(background, bg).toMatch(/^#[0-9a-f]{6}$/);
      expect(foreground, text).toMatch(/^#[0-9a-f]{6}$/);
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
    });
  }
});
