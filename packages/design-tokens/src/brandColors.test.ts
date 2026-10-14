import { describe, expect, it } from 'vitest';

import { generateBrandColors } from './brandColors';
import { contrastRatio } from './contrast';

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

  // Brands spanning the hue wheel, light and dark: the generated ramp's 400
  // step is light for some and dark for others.
  const BRANDS = [
    '#307300',
    '#0000ff',
    '#1d4ed8',
    '#7c3aed',
    '#db2777',
    '#ea580c',
    '#ca8a04',
    '#ffff00',
    '#0891b2',
    '#111a13',
  ];

  it.each(BRANDS)('on-400 reads on brand-400 for %s', (brand) => {
    const ramp = generateBrandColors(brand);
    expect(contrastRatio(ramp['on-400'], ramp['400'])).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  // The dark date picker's range band: body text (--color-gray-dark-25) on
  // brand-900.
  it.each(BRANDS)('body text reads on brand-900 for %s', (brand) => {
    const ramp = generateBrandColors(brand);
    expect(contrastRatio('#fafafa', ramp['900'])).toBeGreaterThanOrEqual(4.5);
  });
});
