import { DateTime } from 'luxon';
import { Resource } from 'waldur-js-client';

import { formatDate, parseCalendarDate } from '@/core/dateUtils';

import { getRenewedEndDate } from './getRenewedEndDate';
import { useRenewalEstimate } from './useRenewalEstimate';

/**
 * The new end date of a renewal, formatted, and the date the prepaid period
 * runs to before the extension starts when that is later than the current end
 * date. Both come from the backend's quote; until it arrives the end date is
 * the current one plus the extension, which is what it is unless a lowered
 * limit stretches the paid-up period.
 */
export const useRenewedEndDates = (
  resource: Resource,
  extensionMonths: number,
) => {
  const { data } = useRenewalEstimate(resource, extensionMonths);
  if (!extensionMonths) {
    return { newEndDate: null, paidUpEndDate: null };
  }
  const newEndDate = data?.new_end_date
    ? formatDate(parseCalendarDate(data.new_end_date))
    : formatDate(getRenewedEndDate(resource.end_date, extensionMonths));
  // The extension starts at the current end date, or today once that has
  // passed; only a paid-up date beyond that is a stretched term.
  const today = DateTime.local().toISODate();
  const currentEnd =
    resource.end_date && resource.end_date > today ? resource.end_date : today;
  const stretched =
    data?.paid_up_end_date && data.paid_up_end_date > currentEnd;
  return {
    newEndDate,
    paidUpEndDate: stretched
      ? formatDate(parseCalendarDate(data.paid_up_end_date))
      : null,
  };
};
