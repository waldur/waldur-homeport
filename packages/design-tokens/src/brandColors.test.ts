import { describe, expect, it } from 'vitest';

import { generateBrandColors } from './brandColors';

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
