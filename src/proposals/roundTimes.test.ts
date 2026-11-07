import { describe, expect, it } from 'vitest';

import { roundTimesInZone } from './utils';

describe('roundTimesInZone', () => {
  it('reads a picked wall-clock time in the form’s time zone', () => {
    const result = roundTimesInZone({
      timezone: 'Europe/Tallinn',
      cutoff_time: '2027-01-12T15:27',
    });
    expect(new Date(result.cutoff_time).toISOString()).toBe(
      '2027-01-12T13:27:00.000Z',
    );
  });

  it('follows the zone’s offset on the date given', () => {
    const result = roundTimesInZone({
      timezone: 'Europe/Tallinn',
      start_time: '2026-10-07T16:27',
    });
    expect(new Date(result.start_time).toISOString()).toBe(
      '2026-10-07T13:27:00.000Z',
    );
  });

  it('keeps a time that already carries its offset', () => {
    const result = roundTimesInZone({
      timezone: 'Europe/Tallinn',
      start_time: '2026-10-07T13:27:12.717873+00:00',
      allocation_date: '2027-03-06T13:27:12Z',
    });
    expect(result.start_time).toBe('2026-10-07T13:27:12.717873+00:00');
    expect(result.allocation_date).toBe('2027-03-06T13:27:12Z');
  });

  it('leaves an empty cut-off empty', () => {
    expect(
      roundTimesInZone({ timezone: 'UTC', cutoff_time: null }).cutoff_time,
    ).toBeNull();
  });
});
