import { DateTime } from 'luxon';

import { parseCalendarDate } from '@/core/dateUtils';

/**
 * The end date a renewal gives a resource, as the backend computes it: the
 * extension is added to the current end date, or to today when that date has
 * passed or is not set.
 */
export const getRenewedEndDate = (
  endDate: string | null | undefined,
  extensionMonths: number,
  now: DateTime = DateTime.local(),
): DateTime => {
  const today = now.startOf('day');
  const current = endDate ? parseCalendarDate(endDate) : today;
  const base = current.isValid && current > today ? current : today;
  return base.plus({ months: extensionMonths });
};
