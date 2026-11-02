import { describe, expect, it } from 'vitest';

import { formatDurationText } from './measure';

describe('formatDurationText', () => {
  it.each([
    [0, 's', '0s'],
    [0.0004, 's', '<1ms'],
    [850, 'ms', '850ms'],
    [12.345, 's', '12.35s'],
    [725, 's', '12m 5s'],
    [3 * 86400 + 4 * 3600 + 59, 's', '3d 4h'],
    [86400 + 120, 's', '1d'],
  ] as const)('reads %s %s as %s', (value, unit, text) => {
    expect(formatDurationText(value, { unit })).toBe(text);
  });
});
