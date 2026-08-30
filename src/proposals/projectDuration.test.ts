import { describe, expect, it } from 'vitest';

import {
  formatPrepaidMonthsCap,
  formatProjectDuration,
  getPrepaidMonthsCap,
  getProjectDuration,
} from './projectDuration';

describe('project duration', () => {
  // A call that fixes the duration fixes it for every project it awards; the
  // subscriptions requested run inside it, never past it.
  it('lets the fixed duration win over any requested subscription', () => {
    expect(getProjectDuration(2, 90)).toEqual({ days: 90 });
    expect(getProjectDuration(null, 90)).toEqual({ days: 90 });
    expect(getProjectDuration(0, 90)).toEqual({ days: 90 });
  });

  it('lets the longest subscription decide when the call fixes nothing', () => {
    expect(getProjectDuration(2, null)).toEqual({ months: 2 });
    expect(getProjectDuration(6, 0)).toEqual({ months: 6 });
  });

  // Whole months that fit inside the fixed duration, measured from today —
  // the same rule the period selector applies to its options.
  it('caps prepaid subscriptions by the fixed duration', () => {
    expect(getPrepaidMonthsCap(null)).toBeNull();
    expect(getPrepaidMonthsCap(90)).toBeGreaterThanOrEqual(2);
    expect(getPrepaidMonthsCap(90)).toBeLessThanOrEqual(3);
    expect(getPrepaidMonthsCap(365)).toBeGreaterThanOrEqual(11);
    expect(getPrepaidMonthsCap(10)).toBe(0);
    expect(formatPrepaidMonthsCap(1)).toBe('up to 1 month');
    expect(formatPrepaidMonthsCap(2)).toBe('up to 2 months');
  });

  // Open-ended, and said so by saying nothing: a day count would be true only
  // relative to a date nobody knows yet.
  it('reports no duration when neither is known', () => {
    expect(getProjectDuration(null, null)).toBeNull();
    expect(getProjectDuration(undefined, undefined)).toBeNull();
    expect(formatProjectDuration(null)).toBeNull();
  });

  it('names months and days in their own units', () => {
    expect(formatProjectDuration({ months: 1 })).toBe('1 month');
    expect(formatProjectDuration({ months: 6 })).toBe('6 months');
    expect(formatProjectDuration({ days: 1 })).toBe('1 day');
    expect(formatProjectDuration({ days: 90 })).toBe('90 days');
  });
});
