import { describe, expect, it } from 'vitest';

import { generateColors } from './generateColors';

const colorRangeInfo = {
  colorStart: 0.25,
  colorEnd: 0.65,
  useEndAsStart: true,
};

describe('generateColors', () => {
  it('returns an array of 5 hex color strings', () => {
    const colors = generateColors(5, colorRangeInfo);
    expect(colors).toHaveLength(5);
    colors.forEach((c) => {
      expect(c).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it('returns array of length 1 when amount is 1', () => {
    const colors = generateColors(1, colorRangeInfo);
    expect(colors).toHaveLength(1);
    expect(colors[0]).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('returns empty array when amount is 0', () => {
    const colors = generateColors(0, colorRangeInfo);
    expect(colors).toEqual([]);
  });
});
