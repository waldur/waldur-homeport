import { isEmptyValue } from '@/core/isEmptyValue';
import { formatFilesize } from '@/core/utils';

import { formatProp, FormattedProperty } from './types';

// API decimals arrive as strings ("12.50"), so both read as numbers.
export type NumberValue = number | string | null | undefined;

const toNumber = (value: NumberValue) =>
  typeof value === 'string' ? parseFloat(value) : (value as number);

const isMissingNumber = (value: NumberValue) =>
  isEmptyValue(value) || Number.isNaN(toNumber(value));

export interface FileSizeFormatOptions {
  /** The unit the value is in. Defaults to bytes. */
  unit?: 'B' | 'KB' | 'MB' | 'GB' | 'TB';
}

const fileSizeText = (value: NumberValue, { unit = 'B' }) =>
  String(formatFilesize(toNumber(value), unit));

/** A size in bytes (or `unit`), in the largest unit that keeps it readable. */
export const formatFileSizeValue = (
  value: NumberValue,
  options: FileSizeFormatOptions = {},
): FormattedProperty | null => {
  if (isMissingNumber(value)) {
    return null;
  }
  const text = fileSizeText(value, options);
  const node = (
    <data value={toNumber(value)} className="tabular-nums">
      {text}
    </data>
  );
  return formatProp(node, text);
};

export interface DurationFormatOptions {
  /** The unit the value is in. Defaults to seconds. */
  unit?: 's' | 'ms';
}

const STEPS: [string, number][] = [
  ['d', 86_400_000],
  ['h', 3_600_000],
  ['m', 60_000],
  ['s', 1000],
];

/**
 * The two largest units that are not zero: `3d 4h`, `12m 5s`. Under a
 * minute the seconds keep two decimals (`12.34s`), under a second it is
 * milliseconds (`850ms`, `<1ms`).
 */
export const formatDurationText = (
  value: NumberValue,
  { unit = 's' }: DurationFormatOptions,
) => {
  const ms = Math.abs(toNumber(value)) * (unit === 's' ? 1000 : 1);
  if (ms === 0) return '0s';
  if (ms < 1) return '<1ms';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60_000) return `${Number((ms / 1000).toFixed(2))}s`;
  const parts: string[] = [];
  let rest = ms;
  for (const [suffix, size] of STEPS) {
    const count = Math.floor(rest / size);
    rest -= count * size;
    if (count > 0 || parts.length > 0) parts.push(`${count}${suffix}`);
  }
  return parts
    .slice(0, 2)
    .filter((part) => !part.startsWith('0'))
    .join(' ');
};

/** A span of time: uptime, latency, CPU time. */
export const formatDurationValue = (
  value: NumberValue,
  options: DurationFormatOptions = {},
): FormattedProperty | null => {
  if (isMissingNumber(value)) {
    return null;
  }
  const text = formatDurationText(value, options);
  const node = (
    <data value={toNumber(value)} className="tabular-nums">
      {text}
    </data>
  );
  return formatProp(node, text);
};

export interface PercentFormatOptions {
  /** The value is a ratio, 0 to 1, not a percentage. */
  ratio?: boolean;
  /** Decimals shown. Defaults to 1. */
  fractionDigits?: number;
}

const percentText = (
  value: NumberValue,
  { ratio, fractionDigits = 1 }: PercentFormatOptions,
) => `${(toNumber(value) * (ratio ? 100 : 1)).toFixed(fractionDigits)}%`;

/** A share of a whole. */
export const formatPercentValue = (
  value: NumberValue,
  options: PercentFormatOptions = {},
): FormattedProperty | null => {
  if (isMissingNumber(value)) {
    return null;
  }
  const text = percentText(value, options);
  const node = (
    <data value={toNumber(value)} className="tabular-nums">
      {text}
    </data>
  );
  return formatProp(node, text);
};
