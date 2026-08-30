import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import {
  getLongestPrepaidMonths,
  getRequestedPrepaidMonths,
} from './prepaidDuration';

const offering = (prepaid = true) => ({
  components: [
    { type: 'cpu', billing_type: 'limit' },
    { type: 'gpu_hours', billing_type: 'one', is_prepaid: prepaid },
  ],
});

const request = (months?: number, prepaid = true) => ({
  attributes: months ? { prepaid_duration_months: months } : {},
  requested_offering: offering(prepaid),
});

/** How requests written before the period became a length still name it. */
const legacyRequest = (months: number, prepaid = true) => ({
  attributes: {
    end_date: DateTime.now().plus({ months }).toISODate() as string,
  },
  requested_offering: offering(prepaid),
});

describe('prepaid duration', () => {
  it('reads the months requested for a prepaid offering', () => {
    expect(getRequestedPrepaidMonths(request(6))).toBe(6);
  });

  // The attribute alone means nothing: only an offering with a prepaid
  // component is bought as a subscription.
  it('ignores the months when nothing in the offering is prepaid', () => {
    expect(getRequestedPrepaidMonths(request(6, false))).toBeNull();
  });

  it('reports no duration when the request has not named one', () => {
    expect(getRequestedPrepaidMonths(request())).toBeNull();
  });

  // Otherwise such a request showed a dash in the period column and a single
  // period's price in its expanded row, while the table beside it charged the
  // whole subscription.
  it('measures a period still stored as an end date', () => {
    expect(getRequestedPrepaidMonths(legacyRequest(12))).toBe(12);
  });

  it('ignores an end date when nothing in the offering is prepaid', () => {
    expect(getRequestedPrepaidMonths(legacyRequest(12, false))).toBeNull();
  });

  it('reports no duration for an end date that has already passed', () => {
    expect(getRequestedPrepaidMonths(legacyRequest(-3))).toBeNull();
  });

  it('prefers the stored length over a stale end date beside it', () => {
    const row = { ...legacyRequest(3) };
    row.attributes = { ...row.attributes, prepaid_duration_months: 12 } as any;
    expect(getRequestedPrepaidMonths(row)).toBe(12);
  });

  // The project cannot end before its longest subscription does.
  it('takes the longest of several prepaid requests', () => {
    expect(getLongestPrepaidMonths([request(3), request(12), request(6)])).toBe(
      12,
    );
  });

  it('has no derived duration when no request is prepaid', () => {
    expect(getLongestPrepaidMonths([request(6, false), request()])).toBeNull();
    expect(getLongestPrepaidMonths([])).toBeNull();
    expect(getLongestPrepaidMonths(undefined)).toBeNull();
  });
});
