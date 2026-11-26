import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { formatDate, parseCalendarDate } from '@/core/dateUtils';

import { useRenewalEstimate } from './useRenewalEstimate';
import { useRenewedEndDates } from './useRenewedEndDates';

vi.mock('./useRenewalEstimate', () => ({
  useRenewalEstimate: vi.fn(),
}));

const withEstimate = (data: object) =>
  vi.mocked(useRenewalEstimate).mockReturnValue({ data } as any);

const render = (endDate: string) =>
  renderHook(() =>
    useRenewedEndDates({ uuid: 'r', end_date: endDate } as any, 12),
  ).result.current;

const shown = (date: string) => formatDate(parseCalendarDate(date));

describe('useRenewedEndDates', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 26, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the paid-up date when lower limits stretch the term', () => {
    withEstimate({
      new_end_date: '2029-03-26',
      paid_up_end_date: '2028-03-26',
    });

    const dates = render('2027-11-25');

    expect(dates.paidUpEndDate).toBe(shown('2028-03-26'));
    expect(dates.newEndDate).toBe(shown('2029-03-26'));
  });

  it('shows no paid-up date when the term is not stretched', () => {
    withEstimate({
      new_end_date: '2028-11-25',
      paid_up_end_date: '2027-11-25',
    });

    expect(render('2027-11-25').paidUpEndDate).toBeNull();
  });

  it('shows no paid-up date for an expired resource extended from today', () => {
    withEstimate({
      new_end_date: '2027-11-26',
      paid_up_end_date: '2026-11-26',
    });

    const dates = render('2026-11-01');

    expect(dates.paidUpEndDate).toBeNull();
    expect(dates.newEndDate).toBe(shown('2027-11-26'));
  });
});
