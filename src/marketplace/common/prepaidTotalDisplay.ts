import { DateTime } from 'luxon';

import { translate } from '@/i18n';

/**
 * Whether an offering shows its prepaid components as one total for the whole
 * subscription instead of a monthly amount.
 *
 * A prepaid component is ordered as an amount per month, and the site agent
 * hands the backend the amount multiplied by the months ordered. A provider
 * whose backend enforces that total as a single budget turns this on so the
 * portal shows the figure that actually applies.
 *
 * Read loosely: the option is newer than the published SDK types.
 */
export const showsPrepaidLimitsAsTotal = (
  pluginOptions: object | null | undefined,
): boolean =>
  Boolean(
    (pluginOptions as { display_prepaid_limits_as_total?: boolean } | null)
      ?.display_prepaid_limits_as_total,
  );

/** A resource as the backend serves it once it names its total components. */
export interface PrepaidTotalResource {
  prepaid_total_component_types?: string[] | null;
}

/**
 * The component types the backend shows as one total for a resource's
 * subscription: one-time prepaid components resolved under its plan, and none
 * unless the offering shows prepaid limits as a total.
 *
 * Read loosely: the field is newer than the published SDK types.
 */
export const getPrepaidTotalComponentTypes = (
  resource: PrepaidTotalResource | null | undefined,
): string[] => resource?.prepaid_total_component_types ?? [];

/**
 * The months a prepaid period runs, counted the way the backend bills them
 * (`calculate_duration_months`) and the SLURM site agent multiplies the limit
 * (`_calculate_duration_months`): whole calendar months from the start to the
 * end date, a partial month rounded up, and never fewer than one.
 *
 * Undefined when either date is missing: there is no period to multiply by.
 */
export const getPrepaidDurationMonths = (
  created: string | null | undefined,
  endDate: string | null | undefined,
): number | undefined => {
  if (!created || !endDate) {
    return undefined;
  }
  // setZone keeps the calendar day the backend stored, rather than the day
  // the viewer's time zone shifts it to.
  const start = DateTime.fromISO(created, { setZone: true });
  const end = DateTime.fromISO(endDate, { setZone: true });
  if (!start.isValid || !end.isValid) {
    return undefined;
  }
  let months = (end.year - start.year) * 12 + (end.month - start.month);
  if (end.day > start.day) {
    months += 1;
  }
  return Math.max(1, months);
};

/** "1 month", "3 months". */
export const formatMonthCount = (count: number): string =>
  count === 1 ? translate('1 month') : translate('{count} months', { count });
