import { describe, expect, it } from 'vitest';

import { getLimitIncrease } from './getLimitIncrease';

describe('getLimitIncrease', () => {
  it('drops floating-point noise from fractional limits', () => {
    expect(getLimitIncrease(1.2, 1.5)).toBe(0.3);
    expect(String(getLimitIncrease('1.2', '1.5'))).toBe('0.3');
  });

  it('keeps whole and negative differences', () => {
    expect(getLimitIncrease('15', '20')).toBe(5);
    expect(getLimitIncrease(20, 15)).toBe(-5);
  });
});
