import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import { getMonthOptions, snapToOfferedMonths } from './prepaidConstraints';

const constraints = (
  min: number,
  max: number | null = null,
  step = 1,
): Parameters<typeof getMonthOptions>[0] => ({
  min_prepaid_duration: min,
  max_prepaid_duration: max,
  prepaid_duration_step: step,
});

/** A deadline `days` from now, in the ISO form the callers hold it in. */
const deadlineIn = (days: number) =>
  DateTime.now().plus({ days }).toISODate() as string;

const values = (options: ReturnType<typeof getMonthOptions>) =>
  options.map((option) => option.value);

describe('getMonthOptions', () => {
  it('always offers something, even for a deadline under a month away', () => {
    // A cap of zero used to read as "no cap", which offered the offering's
    // full length and let the selector's own filter empty the list.
    expect(
      values(getMonthOptions(constraints(1, 12), { end_date: deadlineIn(30) })),
    ).toEqual([1]);
  });

  it('falls back to the offering minimum when the deadline cannot hold it', () => {
    expect(
      values(getMonthOptions(constraints(6), { end_date: deadlineIn(90) })),
    ).toEqual([6]);
  });

  it('caps the options at the deadline when it bites before the maximum', () => {
    expect(
      values(
        getMonthOptions(constraints(1, 12), { end_date: deadlineIn(190) }),
      ),
    ).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('ignores a deadline that is already past, keeping the minimum', () => {
    expect(
      values(
        getMonthOptions(constraints(2, 12), { end_date: deadlineIn(-40) }),
      ),
    ).toEqual([2]);
  });

  it('honours the offering maximum when there is no deadline', () => {
    expect(values(getMonthOptions(constraints(1, 3)))).toEqual([1, 2, 3]);
  });
});

describe('snapToOfferedMonths', () => {
  const offered = [1, 3, 6, 12];

  it('keeps a wanted length that is on offer', () => {
    expect(snapToOfferedMonths(offered, 6)).toBe(6);
  });

  it('snaps down to the longest length that still fits', () => {
    // A twelve-month request in a call that later allows nine becomes six,
    // not the offering's minimum.
    expect(snapToOfferedMonths(offered, 9)).toBe(6);
  });

  it('falls back to the shortest when even that is too long', () => {
    expect(snapToOfferedMonths([6, 12], 3)).toBe(6);
  });

  it('falls back to the shortest when nothing is wanted', () => {
    expect(snapToOfferedMonths(offered, undefined)).toBe(1);
    expect(snapToOfferedMonths(offered, 0)).toBe(1);
  });

  it('has nothing to offer when there are no options', () => {
    expect(snapToOfferedMonths([], 6)).toBeUndefined();
  });
});
