import { describe, expect, it } from 'vitest';

import {
  generateBrandColors,
  generateColors,
  hexToRgb,
} from './generateColors';

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

describe('hexToRgb', () => {
  it('converts #ff0000 to "255, 0, 0"', () => {
    expect(hexToRgb('#ff0000')).toBe('255, 0, 0');
  });

  it('converts #000000 to "0, 0, 0"', () => {
    expect(hexToRgb('#000000')).toBe('0, 0, 0');
  });
});

describe('generateBrandColors', () => {
  it('returns object with expected shade keys and rgb variants', () => {
    const result = generateBrandColors('#3b82f6');
    const expectedKeys = [
      '25',
      '50',
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '900',
      '950',
    ];
    expectedKeys.forEach((key) => {
      expect(result).toHaveProperty(key);
      expect(result).toHaveProperty(`${key}-rgb`);
    });
  });
});
