import { describe, it, expect } from 'vitest';

import { Limits } from '@/marketplace/common/types';

import { calculateFreedCapacity } from './utils';

describe('Reallocate resource limits', () => {
  it('calculates freed capacity correctly', () => {
    const currentLimits: Limits = {
      cores: 100,
      ram: 200,
      storage: 500,
    };

    const newLimits: Limits = {
      cores: 50,
      ram: 150,
      storage: 600,
    };

    const result = calculateFreedCapacity(currentLimits, newLimits);

    expect(result).toEqual({
      cores: 50,
      ram: 50,
    });
  });

  it('returns empty object when no capacity is free', () => {
    const currentLimits: Limits = {
      cores: 100,
      ram: 200,
    };

    const newLimits: Limits = {
      cores: 150,
      ram: 250,
    };

    const result = calculateFreedCapacity(currentLimits, newLimits);

    expect(result).toEqual({});
  });

  it('handles zero values correctly (no freed capacity)', () => {
    const currentLimits: Limits = {
      cores: 100,
      ram: 0,
    };

    const newLimits: Limits = {
      cores: 0,
      ram: 0,
    };

    const result = calculateFreedCapacity(currentLimits, newLimits);

    expect(result).toEqual({
      cores: 100,
    });
  });
});
