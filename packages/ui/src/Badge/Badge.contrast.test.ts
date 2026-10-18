// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { contrastRatio } from 'waldur-design-tokens';
import {
  resolveUtility,
  ThemeName,
} from 'waldur-design-tokens/test-support/theme-tokens';

import { BADGE_STYLES } from './Badge';

/**
 * Every Badge variant and tone must reach WCAG AA for normal text (4.5:1)
 * in both themes. The `bg-*` and `text-*` classes in BADGE_STYLES are
 * resolved against the token CSS (and the default brand ramp): a theme
 * utility such as `bg-success-subtle` takes the theme's value, and in the
 * dark theme a `dark:` class replaces the plain one.
 */

const pick = (classes: string[], kind: 'bg' | 'text', theme: ThemeName) => {
  let value: string | undefined;
  for (const cls of classes) {
    if (cls.startsWith(`${kind}-`)) value = cls.slice(kind.length + 1);
  }
  if (theme === 'dark') {
    for (const cls of classes) {
      if (cls.startsWith(`dark:${kind}-`)) {
        value = cls.slice(kind.length + 6);
      }
    }
  }
  return value;
};

const cases = Object.entries(BADGE_STYLES).flatMap(([variant, tones]) =>
  Object.entries(tones).flatMap(([tone, className]) =>
    (['light', 'dark'] as const).map(
      (theme) => [`${variant}/${tone}/${theme}`, className, theme] as const,
    ),
  ),
);

describe('Badge colours', () => {
  it.each(cases)('%s text reaches 4.5:1', (_, className, theme) => {
    const classes = className.split(/\s+/);
    const bg = pick(classes, 'bg', theme);
    const text = pick(classes, 'text', theme);
    expect(bg, 'a bg-* class').toBeDefined();
    expect(text, 'a text-* class').toBeDefined();
    expect(
      contrastRatio(
        resolveUtility('text', text, theme),
        resolveUtility('bg', bg, theme),
      ),
    ).toBeGreaterThanOrEqual(4.5);
  });
});
