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
