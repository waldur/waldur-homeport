import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { contrastRatio } from '../../../design-tokens/src/contrast';
import { BADGE_STYLES } from '../Badge';

import { PROGRESS_FILL, PROGRESS_SIZE } from './progressStyles';

const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');

const PROGRESS_CSS = read('../../../design-tokens/src/progressColors.css');
const ANIMATIONS_CSS = read('../../../design-tokens/src/animations.css');
const RAMPS_CSS = read('../../../design-tokens/src/colorRamps.css');

const variants = Object.keys(PROGRESS_FILL);

const MIN_LABEL_CONTRAST = 4.4;

// The text between `selector {` and its closing brace.
const block = (css: string, selector: string) => {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) {
    throw new Error(`${selector} not found`);
  }
  return css.slice(start, css.indexOf('\n}', start));
};

const declarations = (css: string) =>
  Object.fromEntries(
    Array.from(css.matchAll(/(--[\w-]+):\s*([^;]+);/g), (m) => [m[1], m[2]]),
  );

const light = declarations(block(PROGRESS_CSS, ':root'));
const dark = declarations(block(PROGRESS_CSS, ":root[data-theme='dark']"));
const ramps = declarations(RAMPS_CSS);

describe('progress tokens', () => {
  it('declares a fill for every variant, in the light theme', () => {
    for (const variant of variants) {
      expect(light[`--progress-fill-${variant}`], variant).toBeDefined();
      expect(light[`--progress-label-${variant}`], variant).toBeDefined();
    }
  });

  it('declares a height for every size', () => {
    for (const size of Object.keys(PROGRESS_SIZE)) {
      expect(light[`--progress-height-${size}`], size).toMatch(/^\d+px$/);
    }
  });

  it('points every fill class at its own token', () => {
    for (const variant of variants) {
      expect(PROGRESS_FILL[variant as keyof typeof PROGRESS_FILL]).toBe(
        `bg-[var(--progress-fill-${variant})]`,
      );
    }
  });

  // `primary` reads the runtime brand variable; every other fill is the
  // colour Badge uses for its `solid` tone, in both themes.
  it('matches the Badge solid fill for each variant', () => {
    const color = (classes: string, prefix: string) =>
      classes.match(
        new RegExp(`(?:^|\\s)${prefix}bg-([a-z]+(?:-dark)?-\\d+)`),
      )?.[1];
    for (const variant of variants) {
      if (variant === 'primary') {
        continue;
      }
      const solid = BADGE_STYLES[variant as keyof typeof BADGE_STYLES].solid;
      const badgeLight = color(solid, '');
      const badgeDark = color(solid, 'dark:') ?? badgeLight;
      expect(light[`--progress-fill-${variant}`], `light ${variant}`).toBe(
        `var(--color-${badgeLight})`,
      );
      expect(
        { ...light, ...dark }[`--progress-fill-${variant}`],
        `dark ${variant}`,
      ).toBe(`var(--color-${badgeDark})`);
    }
  });

  // Each label is white or gray-900, whichever reads better on its fill; the
  // weakest pairing (indigo, light) is 4.40:1, just under AA's 4.5.
  it('keeps every inner label readable on its fill', () => {
    const resolve = (value: string | undefined): string | undefined => {
      const m = value?.match(/^var\((--[\w-]+)\)$/);
      return m ? resolve(ramps[m[1]]) : value;
    };
    const failures: string[] = [];
    for (const variant of variants) {
      if (variant === 'primary') {
        continue; // the live brand colour, not resolvable here
      }
      for (const [theme, tokens] of [
        ['light', light],
        ['dark', { ...light, ...dark }],
      ] as const) {
        const fill = resolve(tokens[`--progress-fill-${variant}`]) as string;
        const label = resolve(tokens[`--progress-label-${variant}`]) as string;
        const ratio = contrastRatio(fill, label);
        const best = Math.max(
          contrastRatio(fill, '#ffffff'),
          contrastRatio(fill, ramps['--color-gray-900']),
        );
        if (ratio < MIN_LABEL_CONTRAST || ratio < best) {
          failures.push(`${theme} ${variant} ${ratio.toFixed(2)}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });
});

describe('progress motion', () => {
  it('has the indeterminate keyframe and a reduced-motion fallback', () => {
    expect(ANIMATIONS_CSS).toContain(
      '@keyframes waldur-progress-indeterminate',
    );
    expect(ANIMATIONS_CSS).toContain('[data-progress-indeterminate]');
  });

  it('drops the width transition under reduced motion', () => {
    const reduced = PROGRESS_CSS.slice(
      PROGRESS_CSS.indexOf('prefers-reduced-motion'),
    );
    expect(reduced).toContain('--progress-transition: none');
  });
});
