import {
  ComparatorEnum,
  MetricGoalPeriodEnum,
  OfferingMetricStateEnum,
  ProjectAggregationEnum,
} from 'waldur-js-client';

import { translate } from '@/i18n';

export const getProjectAggregationOptions = (): {
  value: ProjectAggregationEnum;
  label: string;
}[] => [
  { value: 'sum', label: translate('Add the resource figures up') },
  { value: 'mean', label: translate('Average the resource figures') },
];

export const getComparatorOptions = (): {
  value: ComparatorEnum;
  label: string;
}[] => [
  { value: 'ge', label: translate('At least') },
  { value: 'le', label: translate('At most') },
];

export const getGoalPeriodOptions = (): {
  value: MetricGoalPeriodEnum;
  label: string;
}[] => [
  { value: 'month', label: translate('Calendar month') },
  { value: 'quarter', label: translate('Calendar quarter') },
  { value: 'rolling_30d', label: translate('Last 30 days') },
];

/**
 * The window a card's figure covers, for people reading a breakdown of it:
 * a calendar period runs from its first day (UTC) up to now.
 * @example "October 2026, so far"
 */
export const formatMetricPeriod = (period: string, periodStart: string) => {
  const start = new Date(periodStart);
  if (period === 'rolling_30d') return translate('Last 30 days');
  if (period === 'quarter') {
    return translate('Q{quarter} {year}, so far', {
      quarter: Math.floor(start.getUTCMonth() / 3) + 1,
      year: start.getUTCFullYear(),
    });
  }
  return translate('{month}, so far', {
    month: start.toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }),
  });
};

export const getKindLabel = (kind: string) =>
  kind === 'counter' ? translate('Counter') : translate('Gauge');

export const getStateLabel = (state: OfferingMetricStateEnum) =>
  ({
    active: translate('Active'),
    paused: translate('Paused'),
    archived: translate('Archived'),
  })[state];

export const getStateVariant = (state: OfferingMetricStateEnum) =>
  state === 'active' ? 'success' : state === 'paused' ? 'warning' : 'neutral';

// UCUM writes counted things as annotations, {learners}; people read "learners".
export const formatUnit = (unit?: string) => (unit || '').replace(/[{}]/g, '');

export const formatFigure = (
  value: number | null | undefined,
  unit?: string,
) =>
  value === null || value === undefined
    ? '—'
    : `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}${
        unit ? ` ${formatUnit(unit)}` : ''
      }`;
