import { DateTime } from 'luxon';
import { Project, OfferingComponent } from 'waldur-js-client';

import { formatISODate } from '@/core/dateUtils';
import { translate } from '@/i18n';

export interface PrepaidConstraints {
  min_prepaid_duration: number;
  max_prepaid_duration: number | null;
  prepaid_duration_step: number;
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/**
 * Merge duration constraints from multiple prepaid components into a single
 * set of constraints that satisfies all of them simultaneously.
 *
 * - min = MAX of all minimums (most restrictive)
 * - max = MIN of all maximums (most restrictive)
 * - step = GCD of all steps (largest step that divides evenly into all)
 */
/**
 * The order/request attribute that carries the chosen length in whole months.
 * The backend prices a prepaid component by it and only measures `end_date`
 * when it is absent.
 */
export const PREPAID_DURATION_MONTHS = 'prepaid_duration_months';

export const mergePrepaidConstraints = (
  components: Pick<
    OfferingComponent,
    'min_prepaid_duration' | 'max_prepaid_duration' | 'prepaid_duration_step'
  >[],
): PrepaidConstraints => {
  let min = 1;
  let max: number | null = null;
  let step: number | null = null;

  for (const c of components) {
    if (c.min_prepaid_duration) {
      min = Math.max(min, c.min_prepaid_duration);
    }
    if (c.max_prepaid_duration) {
      max =
        max === null
          ? c.max_prepaid_duration
          : Math.min(max, c.max_prepaid_duration);
    }
    if (c.prepaid_duration_step) {
      step =
        step === null
          ? c.prepaid_duration_step
          : gcd(step, c.prepaid_duration_step);
    }
  }

  return {
    min_prepaid_duration: min,
    max_prepaid_duration: max,
    prepaid_duration_step: step ?? 1,
  };
};

export const getMonthOptions = (
  constraints: PrepaidConstraints,
  project?: Pick<Project, 'end_date'>,
  startDate?: string,
) => {
  const effectiveStartDate = DateTime.fromISO(
    startDate || formatISODate(DateTime.now()),
  );

  let maxMonthsAllowedByProject: number | null = null;
  if (project?.end_date) {
    const projectEndDate = DateTime.fromISO(project.end_date);
    maxMonthsAllowedByProject = Math.floor(
      projectEndDate.diff(effectiveStartDate, 'months').months,
    );
  }

  const offeringMax = constraints.max_prepaid_duration;
  let trueMaxDuration: number;

  // Compared against null, not truthiness: a deadline less than a month away
  // yields a cap of zero, and treating that as "no cap" offered the offering's
  // full length — up to a year past the date the subscription has to end on.
  if (offeringMax && maxMonthsAllowedByProject !== null) {
    trueMaxDuration = Math.min(offeringMax, maxMonthsAllowedByProject);
  } else if (offeringMax) {
    trueMaxDuration = offeringMax;
  } else if (maxMonthsAllowedByProject !== null) {
    trueMaxDuration = maxMonthsAllowedByProject;
  } else {
    trueMaxDuration = 12;
  }

  const min = constraints.min_prepaid_duration || 1;
  const stepSize = constraints.prepaid_duration_step || 1;
  // The offering's minimum is a floor even when the deadline sits below it, so
  // there is always something to choose. Callers that can say so should tell
  // the applicant the choice overruns the deadline; see snapToOfferedMonths.
  const max = Math.max(min, trueMaxDuration);

  const options = [];
  for (let i = min; i <= max; i += stepSize) {
    options.push({
      value: i,
      label:
        i === 1
          ? translate('1 month')
          : translate('{count} months', { count: i }),
    });
  }

  return options;
};

/**
 * Whole months that fit before a deadline — the same measure getMonthOptions
 * uses to cap its options against a project's end date.
 */
export const getMonthsUntil = (endDate: string, startDate?: string): number =>
  Math.floor(
    DateTime.fromISO(endDate).diff(
      DateTime.fromISO(startDate || formatISODate(DateTime.now())),
      'months',
    ).months,
  );

/**
 * The longest offered duration that does not exceed the wanted one, falling
 * back to the shortest on offer when even that is too long.
 *
 * Snapping down rather than to the first option keeps a subscription as close
 * as the offer allows to what was chosen: a twelve-month request against an
 * offer of one, three, six or nine becomes nine, not the offering's minimum.
 */
export const snapToOfferedMonths = (
  offered: number[],
  wanted: number | undefined,
): number | undefined => {
  if (!offered.length) return undefined;
  if (!wanted || wanted <= 0) return offered[0];
  const fitting = offered.filter((value) => value <= wanted);
  return fitting.length ? Math.max(...fitting) : offered[0];
};

export const calculateMonthsDifference = (
  startDate: string,
  endDate: string,
): number => {
  const start = DateTime.fromISO(startDate);
  const end = DateTime.fromISO(endDate);
  const diff = end.diff(start, 'months').months;
  return Math.ceil(diff);
};

export const getDatePickerConstraints = (
  constraints: PrepaidConstraints,
  project?: Pick<Project, 'end_date'>,
  effectiveStartDate?: string,
) => {
  const start = DateTime.fromISO(
    effectiveStartDate || formatISODate(DateTime.now()),
  );
  const minDuration = constraints.min_prepaid_duration || 1;
  const maxDuration = constraints.max_prepaid_duration;

  const result: { minDate: string; maxDate?: string } = {
    minDate: start.plus({ months: minDuration }).toISODate(),
  };

  const projectEndDate = project?.end_date
    ? DateTime.fromISO(project.end_date)
    : null;
  const offeringMaxEndDate = maxDuration
    ? start.plus({ months: maxDuration })
    : null;

  if (projectEndDate && offeringMaxEndDate) {
    result.maxDate =
      projectEndDate < offeringMaxEndDate
        ? projectEndDate.toISODate()
        : offeringMaxEndDate.toISODate();
  } else if (projectEndDate) {
    result.maxDate = projectEndDate.toISODate();
  } else if (offeringMaxEndDate) {
    result.maxDate = offeringMaxEndDate.toISODate();
  }

  return result;
};
