import { describe, expect, it } from 'vitest';

import { hexToRgb } from './colorMath';

describe('hexToRgb', () => {
  it('converts #ff0000 to "255, 0, 0"', () => {
    expect(hexToRgb('#ff0000')).toBe('255, 0, 0');
  });

  it('converts #000000 to "0, 0, 0"', () => {
    expect(hexToRgb('#000000')).toBe('0, 0, 0');
  });
});
