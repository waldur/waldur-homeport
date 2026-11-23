import { DateTime, Settings } from 'luxon';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getEndDateStatus } from './endDateStatus';

const status = (end_date: string, effective_end_date?: string) =>
  getEndDateStatus({ end_date, effective_end_date }, 30);

describe('getEndDateStatus', () => {
  beforeEach(() => {
    // Late in the day, so nothing depends on the time being midnight.
    const fixedNow = DateTime.fromISO('2026-11-14T22:30:00').toMillis();
    Settings.now = () => fixedNow;
  });

  afterEach(() => {
    Settings.now = () => Date.now();
  });

  it('has nothing to say without an end date', () => {
    expect(
      getEndDateStatus({ end_date: null, effective_end_date: null }, 30),
    ).toBeNull();
  });

  // Access is lost at the start of the effective end date (28 Nov), so the
  // last usable day is 27 Nov: 13 days after today, not 14.
  it('counts the grace period to the last usable day', () => {
    expect(status('2026-11-10', '2026-11-28')).toEqual({
      kind: 'grace',
      daysLeft: 13,
    });
  });

  it('reads a timestamped end date as the day it names', () => {
    // UTC midnight of the 28th is still the 27th west of UTC; the badge must
    // agree with daysUntilAccessEnds, which counts calendar days.
    expect(status('2026-11-10T00:00:00Z', '2026-11-28T00:00:00Z')).toEqual({
      kind: 'grace',
      daysLeft: 13,
    });
  });

  it('is on the last day of the grace period the day before it ends', () => {
    expect(status('2026-11-10', '2026-11-15')).toEqual({
      kind: 'grace',
      daysLeft: 0,
    });
  });

  // The backend still reports is_in_grace_period on this day, but
  // is_expired is also true and the resources are terminated.
  it('is expired, not in grace, on the effective end date itself', () => {
    expect(status('2026-11-10', '2026-11-14')).toEqual({
      kind: 'expired',
      daysAgo: 0,
    });
    expect(status('2026-11-09', '2026-11-13')).toEqual({
      kind: 'expired',
      daysAgo: 1,
    });
  });

  // is_in_grace_period needs end_date < today, so with a grace period the
  // end date itself is still an ordinary day.
  it('starts the grace period the day after the end date', () => {
    expect(status('2026-11-14', '2026-11-24')).toEqual({
      kind: 'approaching',
      daysLeft: 0,
      endsAccess: false,
    });
    expect(status('2026-11-13', '2026-11-23')).toEqual({
      kind: 'grace',
      daysLeft: 8,
    });
  });

  // Without a grace period the end date is when access is lost.
  it('counts an end date without grace to the day before it', () => {
    expect(status('2026-11-24', '2026-11-24')).toEqual({
      kind: 'approaching',
      daysLeft: 9,
      endsAccess: true,
    });
    expect(status('2026-11-24')).toEqual({
      kind: 'approaching',
      daysLeft: 9,
      endsAccess: true,
    });
    expect(status('2026-11-15', '2026-11-15')).toEqual({
      kind: 'approaching',
      daysLeft: 0,
      endsAccess: true,
    });
    expect(status('2026-11-14', '2026-11-14')).toEqual({
      kind: 'expired',
      daysAgo: 0,
    });
  });

  it('stays quiet until the end date is near', () => {
    expect(status('2027-01-31', '2027-01-31')).toBeNull();
  });
});
