import { describe, expect, it } from 'vitest';

import { validateFixedDuration } from './GeneralConfigurationSection';

describe('validateFixedDuration', () => {
  it('accepts an empty value, which clears the fixed duration', () => {
    expect(validateFixedDuration(null)).toBeUndefined();
    expect(validateFixedDuration('')).toBeUndefined();
    expect(validateFixedDuration(undefined)).toBeUndefined();
  });

  it('accepts a positive whole number, including the string form', () => {
    expect(validateFixedDuration(1)).toBeUndefined();
    expect(validateFixedDuration('45')).toBeUndefined();
  });

  it('rejects values the backend would refuse', () => {
    expect(validateFixedDuration(0)).toBeTruthy();
    expect(validateFixedDuration(-5)).toBeTruthy();
    expect(validateFixedDuration('1.5')).toBeTruthy();
    expect(validateFixedDuration('abc')).toBeTruthy();
  });
});
