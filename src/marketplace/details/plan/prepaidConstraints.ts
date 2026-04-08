import { DateTime } from 'luxon';
import { Project } from 'waldur-js-client';

import { formatISODate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { OfferingComponent } from '@waldur/marketplace/types';

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
export const mergePrepaidConstraints = (
  components: Pick<
    OfferingComponent,
    'min_prepaid_duration' | 'max_prepaid_duration' | 'prepaid_duration_step'
  >[],
): PrepaidConstraints => {
  let min = 1;
  let max: number | null = null;
  let step = 1;

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
      step = gcd(step, c.prepaid_duration_step);
    }
  }

  return {
    min_prepaid_duration: min,
    max_prepaid_duration: max,
    prepaid_duration_step: step,
  };
};

export const getMonthOptions = (
  constraints: PrepaidConstraints,
  project?: Project,
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

  if (offeringMax && maxMonthsAllowedByProject) {
    trueMaxDuration = Math.min(offeringMax, maxMonthsAllowedByProject);
  } else if (offeringMax) {
    trueMaxDuration = offeringMax;
  } else if (maxMonthsAllowedByProject) {
    trueMaxDuration = maxMonthsAllowedByProject;
  } else {
    trueMaxDuration = 12;
  }

  const min = constraints.min_prepaid_duration || 1;
  const stepSize = constraints.prepaid_duration_step || 1;
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
  project?: Project,
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
