import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import { getRenewedEndDate } from './getRenewedEndDate';

const today = DateTime.local(2026, 11, 24, 15, 30);

describe('getRenewedEndDate', () => {
  it('extends a future end date from that date', () => {
    expect(getRenewedEndDate('2027-01-31', 1, today).toISODate()).toBe(
      '2027-02-28',
    );
  });

  it('extends a passed end date from today', () => {
    expect(getRenewedEndDate('2026-03-08', 12, today).toISODate()).toBe(
      '2027-11-24',
    );
  });

  it('extends an end date of today from today', () => {
    expect(getRenewedEndDate('2026-11-24', 3, today).toISODate()).toBe(
      '2027-02-24',
    );
  });

  it('extends a resource without an end date from today', () => {
    expect(getRenewedEndDate(null, 6, today).toISODate()).toBe('2027-05-24');
    expect(getRenewedEndDate(undefined, 6, today).toISODate()).toBe(
      '2027-05-24',
    );
  });
});
