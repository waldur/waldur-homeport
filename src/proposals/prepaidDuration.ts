import { DateTime } from 'luxon';

import { formatISODate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import {
  calculateMonthsDifference,
  PREPAID_DURATION_MONTHS,
} from '@/marketplace/details/plan/prepaidConstraints';

/** Months, not an end date: at proposal time the allocation day is unknown. */
export { PREPAID_DURATION_MONTHS };

interface ComponentLike {
  is_prepaid?: boolean;
}

interface RequestLike {
  attributes?: Record<string, any> | null;
  requested_offering?: { components?: ComponentLike[] | unknown };
}

const isPrepaidOffering = (offering?: {
  components?: ComponentLike[] | unknown;
}): boolean =>
  Array.isArray(offering?.components) &&
  offering.components.some((component) => component?.is_prepaid);

/**
 * Months requested for one resource, or null when it is not a prepaid one.
 *
 * Requests written before the switch carry an end date instead of a length.
 * Measuring it here, the same way the cost estimate measures it, is what lets
 * the period column, the expanded row and the totals name one number for such
 * a request rather than a dash, a single period and a full one.
 */
export const getRequestedPrepaidMonths = (row: RequestLike): number | null => {
  if (!isPrepaidOffering(row?.requested_offering)) {
    return null;
  }
  const months = Number(row?.attributes?.[PREPAID_DURATION_MONTHS]);
  if (months > 0) {
    return months;
  }
  const endDate = row?.attributes?.end_date;
  if (typeof endDate !== 'string' || !endDate) {
    return null;
  }
  const legacyMonths = calculateMonthsDifference(
    formatISODate(DateTime.now()),
    endDate,
  );
  return legacyMonths > 0 ? legacyMonths : null;
};

/** The longest subscription requested; null when nothing prepaid was asked for. */
export const getLongestPrepaidMonths = (
  rows: RequestLike[] | undefined | null,
): number | null => {
  const durations = (rows || [])
    .map(getRequestedPrepaidMonths)
    .filter((months): months is number => months !== null);
  return durations.length ? Math.max(...durations) : null;
};

/** A number of months on its own, for the surfaces that only name the length. */
export const formatPrepaidMonths = (months: number): string =>
  months === 1
    ? translate('1 month')
    : translate('{count} months', { count: months });
