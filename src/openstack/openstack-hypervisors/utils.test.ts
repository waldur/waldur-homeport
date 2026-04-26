import { describe, expect, it } from 'vitest';

import { computeUsage, formatMemory, toGb } from './utils';

describe('toGb', () => {
  it('rounds MB to one decimal GB', () => {
    expect(toGb(1024)).toBe(1);
    expect(toGb(1536)).toBe(1.5);
    expect(toGb(0)).toBe(0);
  });
});

describe('formatMemory', () => {
  it('formats MB below 1 GB', () => {
    expect(formatMemory(512)).toBe('512MB');
  });

  it('formats GB between 1 GB and 1 TB', () => {
    expect(formatMemory(1024)).toBe('1.0GB');
    expect(formatMemory(2048)).toBe('2.0GB');
  });

  it('formats TB at or above 1 TB', () => {
    expect(formatMemory(1024 * 1024)).toBe('1.0TB');
    expect(formatMemory(1024 * 1024 * 5)).toBe('5.0TB');
  });
});

describe('computeUsage', () => {
  it('returns available > 0 for normal usage', () => {
    expect(computeUsage(3, 10)).toEqual({
      available: 7,
      overcommitted: 0,
      isOvercommitted: false,
      isEmpty: false,
    });
  });

  it('clamps available to 0 when overcommitted', () => {
    expect(computeUsage(12, 10)).toEqual({
      available: 0,
      overcommitted: 2,
      isOvercommitted: true,
      isEmpty: false,
    });
  });

  it('flags empty when total is 0', () => {
    expect(computeUsage(0, 0).isEmpty).toBe(true);
  });
});
