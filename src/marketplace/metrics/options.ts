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

/** What a card's change badge compares the figure with. */
export const getChangeLabel = (period: string) =>
  period === 'rolling_30d'
    ? translate('Change vs the previous 30 days')
    : period === 'quarter'
      ? translate('Change vs the same days of the previous quarter')
      : translate('Change vs the same days of the previous month');

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

// Two decimals, but a small figure keeps two significant digits: a rate of
// 0.0028 IOPS is not 0.
const formatNumber = (value: number) =>
  value.toLocaleString(
    undefined,
    value !== 0 && Math.abs(value) < 0.01
      ? { maximumSignificantDigits: 2 }
      : { maximumFractionDigits: 2 },
  );

// UCUM's byte, alone or as a rate: By, By/s.
const BYTES = /^By(\/.+)?$/;
// UCUM has no IOPS: I/O operations per second, as storage speaks of them.
const IO_OPERATION = '{I/O operation}';
const IOPS = `${IO_OPERATION}/s`;
// Decimal steps, as UCUM's kBy and MBy are, so a chart's round axis values
// stay round: 600,000,000 By is 600 MB, not 572.2.
const BYTE_UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB'];

// As formatNumber shows it, so units step up on the figure people see.
const round = (value: number) => Math.round(value * 100) / 100;

const formatBytes = (value: number) => {
  let scaled = value;
  let index = 0;
  // 999,996 B is "1 MB", not "1,000 kB".
  while (Math.abs(round(scaled)) >= 1000 && index < BYTE_UNITS.length - 1) {
    scaled /= 1000;
    index += 1;
  }
  return `${formatNumber(scaled)} ${BYTE_UNITS[index]}`;
};

const formatSeconds = (value: number) => {
  if (Math.abs(round(value / 60)) >= 60) {
    return `${formatNumber(value / 3600)} h`;
  }
  if (Math.abs(round(value)) >= 60) return `${formatNumber(value / 60)} min`;
  return `${formatNumber(value)} s`;
};

/**
 * Ticks for an axis in seconds, in whole seconds, minutes or hours, so that
 * 25,000 s is not labelled 6.94 h; null leaves the axis to the chart.
 */
export const getSecondsAxis = (max: number, splitNumber: number) => {
  if (!(max > 0)) return null;
  const [step, symbol] =
    max >= 2 * 3600 ? [3600, 'h'] : max >= 2 * 60 ? [60, 'min'] : [1, 's'];
  const raw = max / splitNumber / step;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const nice = [1, 2, 5, 10]
    .map((multiple) => multiple * magnitude)
    .find((value) => value >= raw);
  return {
    interval: (step === 1 ? nice : Math.max(nice, 1)) * step,
    formatter: (value: number) => `${formatNumber(value / step)} ${symbol}`,
  };
};

// UCUM writes counted things as annotations, singular or plural: {operation},
// {learners}. People read "operations" and "learners".
const pluralize = (word: string) => {
  if (/s$/.test(word)) return word;
  if (/(x|z|ch|sh)$/.test(word)) return `${word}es`;
  if (/[^aeiou]y$/.test(word)) return `${word.slice(0, -1)}ies`;
  return `${word}s`;
};

/** Units whose figures are scaled to a readable size, not shown as written. */
export const isScaledUnit = (unit?: string) =>
  Boolean(unit) && (BYTES.test(unit) || unit === 's');

/**
 * A counter's unit per second, for charts over hours: bytes and I/O
 * operations, read as MB/s and IOPS. null for the rest, whose rates read
 * oddly (seconds per second) or round to nothing (jobs per second).
 */
export const getRateUnit = (unit?: string) =>
  unit === 'By' || unit === IO_OPERATION ? `${unit}/s` : null;

/** A unit as a label, for a column or next to an input in base units. */
export const formatUnit = (unit?: string) => {
  if (!unit) return '';
  if (unit === IOPS) return 'IOPS';
  const bytes = unit.match(BYTES);
  if (bytes) return `${translate('bytes')}${bytes[1] ?? ''}`;
  if (unit === 's') return translate('seconds');
  return unit.replace(/\{([^}]*)\}/g, (_, word) => pluralize(word));
};

export const formatFigure = (
  value: number | null | undefined,
  unit?: string,
) => {
  const number = Number(value);
  if (value === null || value === undefined || !Number.isFinite(number)) {
    return '—';
  }
  const bytes = unit?.match(BYTES);
  if (bytes) return `${formatBytes(number)}${bytes[1] ?? ''}`;
  if (unit === 's') return formatSeconds(number);
  if (!unit) return formatNumber(number);
  if (unit === IOPS) return `${formatNumber(number)} IOPS`;
  // One of a counted thing keeps the word as the definition wrote it.
  const label =
    round(number) === 1 ? unit.replace(/[{}]/g, '') : formatUnit(unit);
  return `${formatNumber(number)} ${label}`;
};
