import { DateTime } from 'luxon';
import type { Matcher } from 'react-day-picker';

/**
 * A date bound in any shape callers pass: a `Date`, an ISO date or datetime
 * string (`DateTime.now().plus(...).toISO()`), a luxon `DateTime`, or the
 * keyword `'today'`, which several callers still use.
 */
export type DateBound = Date | DateTime | string | null | undefined;

export const parseBound = (bound: DateBound): DateTime | undefined => {
  if (bound === null || bound === undefined || bound === '') return undefined;
  if (bound === 'today') return DateTime.now().startOf('day');
  if (bound === 'now') return DateTime.now();
  const dt =
    bound instanceof DateTime
      ? bound
      : bound instanceof Date
        ? DateTime.fromJSDate(bound)
        : DateTime.fromISO(bound);
  return dt.isValid ? dt : undefined;
};

/**
 * Day-granular, inclusive matchers for the calendar: a bound of
 * `2026-06-10T17:45` still leaves all of 10 June selectable. The exact time
 * is enforced separately where a time is picked (`clampToBounds`).
 */
export const boundsToDisabled = (
  minDate: DateBound,
  maxDate: DateBound,
): Matcher[] => {
  const min = parseBound(minDate);
  const max = parseBound(maxDate);
  const matchers: Matcher[] = [];
  if (min) matchers.push({ before: min.startOf('day').toJSDate() });
  if (max) matchers.push({ after: max.startOf('day').toJSDate() });
  return matchers;
};

/** First and last month the calendar may page to. */
export const boundsToMonths = (minDate: DateBound, maxDate: DateBound) => ({
  startMonth: parseBound(minDate)?.startOf('month').toJSDate(),
  endMonth: parseBound(maxDate)?.startOf('month').toJSDate(),
});

export const clampToBounds = (
  value: DateTime,
  minDate: DateBound,
  maxDate: DateBound,
): DateTime => {
  const min = parseBound(minDate);
  const max = parseBound(maxDate);
  if (min && value < min) return min;
  if (max && value > max) return max;
  return value;
};

/**
 * A date field's form value as a `Date`: ISO date or datetime strings (what
 * DateField and DateTimeField store) and `Date`s; anything else is empty.
 */
export const parseDateValue = (value: unknown): Date | null => {
  if (value instanceof Date) return value;
  if (typeof value !== 'string' || !value) return null;
  const dt = DateTime.fromISO(value);
  return dt.isValid ? dt.toJSDate() : null;
};

/**
 * `yyyy-MM-dd` for a picked date, `''` for none — for screens that keep a
 * date as a string in component state (what `<input type="date">` gave).
 */
export const toIsoDate = (value: Date | null | undefined): string =>
  value ? DateTime.fromJSDate(value).toISODate() : '';

/** `yyyy-MM` for a picked month, `''` for none (was `<input type="month">`). */
export const toIsoMonth = (value: Date | null | undefined): string =>
  value ? DateTime.fromJSDate(value).toFormat('yyyy-MM') : '';

/** Sets the time of day on `day`, keeping its date. */
export const withTime = (
  day: Date,
  time: { hour: number; minute: number },
): DateTime =>
  DateTime.fromJSDate(day).set({
    hour: time.hour,
    minute: time.minute,
    second: 0,
    millisecond: 0,
  });

/** Time a freshly picked day gets when no time is known yet. */
export const DEFAULT_TIME = { hour: 12, minute: 0 };

export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm';
