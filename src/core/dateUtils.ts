import { DateTime } from 'luxon';

type DateInput = DateTime | Date | string | number | number[];

type DateFormatter = (date: DateInput) => string;

export const parseDate = (value: DateInput) => {
  if (value instanceof DateTime) {
    return value;
  } else if (typeof value === 'undefined' || value === null) {
    return DateTime.now();
  } else if (typeof value === 'string') {
    // Parse ISO string while preserving original timezone info
    // If no timezone is specified, use local timezone as fallback
    const parsed = DateTime.fromISO(value);
    return parsed.isValid
      ? parsed
      : DateTime.fromISO(value, { zone: DateTime.local().zone });
  } else if (value instanceof Date) {
    return DateTime.fromJSDate(value);
  } else if (typeof value === 'number') {
    return DateTime.fromMillis(value);
  } else if (value instanceof Array) {
    return DateTime.fromObject({
      year: value[0],
      month: value[1] + 1, // convert 0-based to 1-based
      day: value[2],
      hour: value[3],
      minute: value[4],
      second: value[5],
      millisecond: value[6],
    });
  }
};

// Date order is pinned, not taken from the locale, which puts the month first
// in English. Month names and the clock stay localised.

/** @example 2027-02-26 */
export const formatISODate: DateFormatter = (date) =>
  parseDate(date).toISODate();

/** @example 26 Feb 2027 */
export const formatDate: DateFormatter = (date) =>
  parseDate(date).toFormat('d LLL yyyy');

/** @example 26 Feb 2027, 14:00 */
export const formatDateTime: DateFormatter = (date) =>
  parseDate(date).toFormat('d LLL yyyy, t');

/** @example 14:21 */
export const formatTime: DateFormatter = (date) =>
  parseDate(date).toFormat('T');

export const formatRelative: DateFormatter = (date) =>
  parseDate(date).toRelative();

export const formatRelativeWithHour: DateFormatter = (date) => {
  const dateDiff = parseDate(date).diffNow(['hours', 'minutes']);

  if (dateDiff.hours > 24) {
    return parseDate(date).toRelative();
  } else {
    const hours = dateDiff.hours;
    const minutes = dateDiff.minutes;

    if (hours > 0 && minutes > 0) {
      return `${hours} hours ${minutes.toFixed(0)} minutes`;
    } else if (hours > 0) {
      return `${hours} hours`;
    } else {
      return `${minutes.toFixed(0)} minutes`;
    }
  }
};

// MMMM, not LLLL: the format form carries the right grammatical case when the
// day precedes the month (fi heinäkuuta, ru июля, lt liepos). Identical in
// English. The abbreviated formatters keep LLL — MMM degrades to a bare number
// in Finnish and Czech, which is the thing this file exists to avoid.
/** @example 22 July 2024, 14:00 GMT+2 */
export const formatMediumDateTime: DateFormatter = (date) =>
  parseDate(date).toFormat('d MMMM yyyy, t ZZZZ');

/** @example 22 Jul 2024, 14:00 */
export const formatShortDateTime: DateFormatter = (date) =>
  parseDate(date).toFormat('d LLL yyyy, t');

/** @example 2024-07-22T14:00 */
export const formatISOWithoutZone: DateFormatter = (date) =>
  parseDate(date).toFormat("yyyy-MM-dd'T'T");

/** @example July 2022 */
export const formatMonth: DateFormatter = (date) =>
  parseDate(date).toFormat('MMMM yyyy');

export const calculateMonthsDifference = (
  startDate: string,
  endDate: string,
): number => {
  const start = DateTime.fromISO(startDate);
  const end = DateTime.fromISO(endDate);

  return Math.round(end.diff(start, 'months').months);
};

export const formatUptime = (date) => {
  const start = parseDate(date);
  const now = DateTime.now();
  const diff = now.diff(start, ['days', 'hours', 'minutes']).toObject();

  const days = Math.floor(diff.days || 0);
  const hours = Math.floor(diff.hours || 0);
  const minutes = Math.floor(diff.minutes || 0);

  if (days > 1000) {
    return `${days}d`;
  } else if (days > 0) {
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  } else if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  } else {
    return `${minutes}m`;
  }
};
