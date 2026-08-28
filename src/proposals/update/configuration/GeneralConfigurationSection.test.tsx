import { describe, expect, it } from 'vitest';

import {
  resolveFixedDurationChange,
  validateFixedDuration,
} from './GeneralConfigurationSection';

const call = (fixed_duration_in_days: number | null) =>
  ({ fixed_duration_in_days }) as any;

describe('resolveFixedDurationChange', () => {
  it('ignores a payload without the duration', () => {
    expect(resolveFixedDurationChange(call(30), { name: 'Call' })).toBeNull();
  });

  it('detects a new value submitted as a string by the number input', () => {
    expect(
      resolveFixedDurationChange(call(30), { fixed_duration_in_days: '45' }),
    ).toBe('set');
  });

  it('treats an unchanged value as no change', () => {
    expect(
      resolveFixedDurationChange(call(30), { fixed_duration_in_days: '30' }),
    ).toBeNull();
    expect(
      resolveFixedDurationChange(call(null), {
        fixed_duration_in_days: null,
      }),
    ).toBeNull();
  });

  it('detects clearing of an existing value', () => {
    expect(
      resolveFixedDurationChange(call(30), { fixed_duration_in_days: null }),
    ).toBe('clear');
    expect(
      resolveFixedDurationChange(call(30), { fixed_duration_in_days: '' }),
    ).toBe('clear');
  });

  it('detects setting a value on a call without one', () => {
    expect(
      resolveFixedDurationChange(call(null), { fixed_duration_in_days: 45 }),
    ).toBe('set');
  });

  // Zero is a submitted value, not an empty one: the backend rejects it, and
  // announcing it as a clearing would describe the wrong outcome.
  it('does not treat zero as clearing', () => {
    expect(
      resolveFixedDurationChange(call(30), { fixed_duration_in_days: 0 }),
    ).toBe('set');
  });
});

describe('validateFixedDuration', () => {
  it('accepts an empty value, leaving clearing to the confirmation flow', () => {
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
