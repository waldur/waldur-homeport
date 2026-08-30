import { DateTime } from 'luxon';

import { formatISODate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { getMonthsUntil } from '@/marketplace/details/plan/prepaidConstraints';

import { formatPrepaidMonths } from './prepaidDuration';

/**
 * How long the awarded project will run, as the backend decides it.
 *
 * Mirrors `proposal/utils.py::project_end_date` in waldur-mastermind, which
 * is the only place the length is actually resolved: a call that fixes the
 * duration fixes it for every project it awards, and that figure is also the
 * ceiling for any prepaid subscription requested under the call (see
 * getPrepaidMonthsCap). Only a call that fixes nothing lets the longest
 * subscription requested decide, since the project cannot end before it does.
 * A length in months and a length in days are never converted into each
 * other: a day count is true only relative to the date it was measured from,
 * and the allocation date is unknown while the proposal is being written.
 *
 * Neither → null. The project is open-ended, and nothing here invents a figure
 * for it; `Proposal.duration_in_days` is no longer asked of the applicant.
 */
export type ProjectDuration = { months: number } | { days: number } | null;

export const getProjectDuration = (
  prepaidMonths: number | null | undefined,
  fixedDays?: number | null,
): ProjectDuration => {
  if (fixedDays && fixedDays > 0) {
    return { days: fixedDays };
  }
  if (prepaidMonths && prepaidMonths > 0) {
    return { months: prepaidMonths };
  }
  return null;
};

export const formatProjectDuration = (
  duration: ProjectDuration,
): string | null => {
  if (!duration) {
    return null;
  }
  if ('months' in duration) {
    return formatPrepaidMonths(duration.months);
  }
  return duration.days === 1
    ? translate('1 day')
    : translate('{count} days', { count: duration.days });
};

/**
 * The longest prepaid subscription a call's fixed duration admits, in whole
 * months from today. Null when the call fixes nothing; 0 when it is shorter
 * than a month. The period selector offers exactly these lengths, and the
 * backend refuses a longer one.
 */
export const getPrepaidMonthsCap = (
  fixedDays?: number | null,
): number | null => {
  if (!fixedDays || fixedDays <= 0) {
    return null;
  }
  const today = formatISODate(DateTime.now());
  return Math.max(
    0,
    getMonthsUntil(DateTime.now().plus({ days: fixedDays }).toISODate(), today),
  );
};

/** "up to 2 months", for the surfaces that state the cap beside the duration. */
export const formatPrepaidMonthsCap = (cap: number): string =>
  cap === 1
    ? translate('up to 1 month')
    : translate('up to {count} months', { count: cap });

/**
 * The cap as the backend states it, when the call payload carries it — the
 * same helper allocation validates against — else measured here. Kept as a
 * fallback only for a call fetched with a field list that leaves it out.
 */
export const resolvePrepaidMonthsCap = (call: {
  max_prepaid_duration_months?: number | null;
  fixed_duration_in_days?: number | null;
}): number | null =>
  call.max_prepaid_duration_months !== undefined
    ? call.max_prepaid_duration_months
    : getPrepaidMonthsCap(call.fixed_duration_in_days);
