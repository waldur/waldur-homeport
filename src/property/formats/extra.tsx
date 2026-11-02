import { ReactNode } from 'react';

import { cn, isFormattedProperty } from 'waldur-ui';

import { isEmptyValue } from '@/core/isEmptyValue';

import { formatMeterValue } from './meter';
import { formatProp, FormattedProperty } from './types';

/** Single-use custom component: guards against null/undefined before calling render. */
export const formatCustomValue = <T,>(
  data: T,
  render: (d: NonNullable<T>) => ReactNode,
  copyText?: string | ((d: NonNullable<T>) => string),
): FormattedProperty | null => {
  if (isEmptyValue(data)) {
    return null;
  }
  const nonNull = data as NonNullable<T>;
  const text =
    typeof copyText === 'function'
      ? copyText(nonNull)
      : (copyText ??
        (typeof nonNull === 'string' || typeof nonNull === 'number'
          ? String(nonNull)
          : ''));
  return formatProp(render(nonNull), text);
};

export interface PairFormatOptions {
  separator?: string;
  srSeparator?: string;
}

/** Composes two values or formatted properties into a pair (e.g. date range). */
export const formatPairValue = (
  first: unknown,
  second: unknown,
  options: PairFormatOptions = {},
): FormattedProperty | null => {
  const hasFirst = !isEmptyValue(first);
  const hasSecond = !isEmptyValue(second);
  if (!hasFirst && !hasSecond) {
    return null;
  }
  const separator = options.separator ?? ' — ';
  const srSeparator = options.srSeparator;

  if (!hasFirst) {
    const text = isFormattedProperty(second) ? second.text : String(second);
    const node = isFormattedProperty(second) ? second.node : second;
    return formatProp(node as ReactNode, text);
  }
  if (!hasSecond) {
    const text = isFormattedProperty(first) ? first.text : String(first);
    const node = isFormattedProperty(first) ? first.node : first;
    return formatProp(node as ReactNode, text);
  }

  const text1 = isFormattedProperty(first) ? first.text : String(first);
  const text2 = isFormattedProperty(second) ? second.text : String(second);
  const node1 = isFormattedProperty(first) ? first.node : first;
  const node2 = isFormattedProperty(second) ? second.node : second;

  const node = (
    <span>
      {node1 as ReactNode}
      {srSeparator ? (
        <>
          <span aria-hidden="true">{separator}</span>
          <span className="sr-only"> {srSeparator} </span>
        </>
      ) : (
        separator
      )}
      {node2 as ReactNode}
    </span>
  );
  return formatProp(node, `${text1}${separator}${text2}`);
};

export interface MetricFormatOptions {
  polarity?: 'positive' | 'negative' | 'neutral';
  thresholds?: { warning?: number; danger?: number };
  unit?: string;
  indicator?: boolean;
  srLabel?: string;
  fractionDigits?: number;
}

/** Metric with optional thresholds, polarity, and a11y indicator. */
export const formatMetricValue = (
  value: number | string | null | undefined,
  options: MetricFormatOptions = {},
): FormattedProperty | null => {
  if (isEmptyValue(value)) {
    return null;
  }
  const num = typeof value === 'string' ? parseFloat(value) : (value as number);
  if (Number.isNaN(num)) {
    return null;
  }
  const {
    polarity = 'neutral',
    thresholds,
    unit,
    indicator,
    srLabel,
    fractionDigits,
  } = options;

  let status: 'normal' | 'warning' | 'danger' = 'normal';
  if (thresholds) {
    if (polarity === 'positive') {
      if (thresholds.danger !== undefined && num <= thresholds.danger) {
        status = 'danger';
      } else if (
        thresholds.warning !== undefined &&
        num <= thresholds.warning
      ) {
        status = 'warning';
      }
    } else {
      if (thresholds.danger !== undefined && num >= thresholds.danger) {
        status = 'danger';
      } else if (
        thresholds.warning !== undefined &&
        num >= thresholds.warning
      ) {
        status = 'warning';
      }
    }
  }

  const formattedNum =
    fractionDigits !== undefined ? num.toFixed(fractionDigits) : String(num);
  const text = unit ? `${formattedNum} ${unit}` : formattedNum;

  const statusColors = {
    normal: 'text-primary',
    warning: 'text-warning',
    danger: 'text-danger',
  };

  const node = (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 tabular-nums',
        statusColors[status],
      )}
    >
      {indicator && status !== 'normal' && (
        <span
          className={cn(
            'w-2 h-2 rounded-full shrink-0',
            status === 'danger' ? 'bg-danger' : 'bg-warning',
          )}
          aria-hidden="true"
        />
      )}
      {srLabel && <span className="sr-only">{srLabel}: </span>}
      {status !== 'normal' && <span className="sr-only">[{status}] </span>}
      <data value={num}>{text}</data>
    </span>
  );
  return formatProp(node, text);
};

export interface QuotaFormatOptions {
  unit?: string;
  showPercent?: boolean;
  showBar?: boolean;
  unlimitedText?: string;
}

/** Quota (used/limit) with a11y meter and fraction. Backwards-compatible facade over formatMeterValue. */
export const formatQuotaValue = (
  used: number | string | null | undefined,
  limit: number | string | null | undefined,
  options: QuotaFormatOptions = {},
): FormattedProperty | null => {
  return formatMeterValue(used, limit, {
    unit: options.unit,
    showPercent: options.showPercent,
    display: options.showBar ? 'bar' : 'text',
    unlimitedText: options.unlimitedText,
  });
};
