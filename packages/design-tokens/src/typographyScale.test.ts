import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * The type scale is pinned in px: a rem step would follow the 13px/12px root
 * instead of staying put. A deployment font is matched to Inter's apparent
 * size by font-size-adjust (Inter's x-height ratio), not by scaling the steps.
 */
const css = readFileSync(
  path.join(__dirname, 'css/primitives/typography.css'),
  'utf8',
);
const steps = [...css.matchAll(/^\s*(--text-[\w-]+):\s*([^;]+);/gm)];

describe('type scale', () => {
  it('declares a size and a line height for every step', () => {
    const names = steps.map(([, name]) => name);
    const sizes = names.filter((n) => !n.endsWith('--line-height'));
    expect(sizes).toEqual([
      '--text-xs',
      '--text-sm',
      '--text-base',
      '--text-lg',
      '--text-xl',
      '--text-2xl',
      '--text-3xl',
      '--text-4xl',
    ]);
    for (const size of sizes) {
      expect(names).toContain(`${size}--line-height`);
    }
  });

  it.each(steps.map(([, name, value]) => [name, value]))(
    '%s is pinned in px',
    (_name, value) => {
      expect(value).toMatch(/^\d+px$/);
    },
  );

  it("matches every font's x-height to Inter's, but not monospace", () => {
    expect(css).toMatch(/html\s*\{\s*font-size-adjust:\s*0\.546;/);
    expect(css).toMatch(
      /:where\(code, kbd, samp, pre, \.font-mono\)\s*\{\s*font-size-adjust:\s*none;/,
    );
  });
});
