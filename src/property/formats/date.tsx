import { Tooltip } from 'waldur-ui';

import {
  formatDate,
  formatDateTime,
  formatMediumDateTime,
  formatMonth,
  formatRelative,
  parseDate,
} from '@/core/dateUtils';
import { isEmptyValue } from '@/core/isEmptyValue';

import { formatProp, FormattedProperty } from './types';

export type DateValue = string | number | Date | null | undefined;

export interface DateFormatOptions {
  /**
   * `date` (default) `26 Feb 2027`, `datetime` `26 Feb 2027, 14:00`, `long`
   * `26 February 2027, 14:00 GMT+2` (with the zone), `month` `February 2027`.
   */
  precision?: 'date' | 'datetime' | 'long' | 'month';
  /** A number is Unix seconds, not milliseconds. */
  epoch?: boolean;
  /** Read as "3 days ago", with the exact date in a tooltip. */
  relative?: boolean;
}

const FORMATTERS = {
  date: formatDate,
  datetime: formatDateTime,
  long: formatMediumDateTime,
  month: formatMonth,
};

const toInput = (value: DateValue, epoch?: boolean) =>
  epoch && typeof value === 'number' ? value * 1000 : value;

const formatAbsolute = (value: DateValue, options: DateFormatOptions) =>
  FORMATTERS[options.precision ?? 'date'](toInput(value, options.epoch));

export const formatDateValue = (
  value: DateValue,
  options: DateFormatOptions = {},
): FormattedProperty | null => {
  if (
    isEmptyValue(value) ||
    !parseDate(toInput(value, options.epoch)).isValid
  ) {
    return null;
  }
  const input = toInput(value, options.epoch);
  const absolute = formatAbsolute(value, options);
  const dateTime = parseDate(input).toISO();
  const node = options.relative ? (
    <Tooltip label={absolute}>
      <time dateTime={dateTime}>{formatRelative(input)}</time>
    </Tooltip>
  ) : (
    <time dateTime={dateTime}>{absolute}</time>
  );
  return formatProp(node, absolute);
};
