import { DateTime } from 'luxon';

type DateInput = DateTime | Date | string | number | number[];

type DateFormatter = (date: DateInput) => string;

export const parseDate = (value: DateInput) => {
  if (value instanceof DateTime) {
    return value;
  } else if (typeof value === 'undefined' || value === null) {
    return DateTime.now();
  } else if (typeof value === 'string') {
    return DateTime.fromISO(value, { zone: DateTime.local().zone });
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

/** @example 2027-02-26 */
export const formatISODate: DateFormatter = (date) =>
  parseDate(date).toISODate();

/** @example 26 Feb 2027 */
export const formatDate: DateFormatter = (date) =>
  parseDate(date).toLocaleString(DateTime.DATE_MED);

/** @example 26 Feb 2027 14:00 */
export const formatDateTime: DateFormatter = (date) =>
  parseDate(date).toLocaleString(DateTime.DATETIME_MED);

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

/** @example July 22, 2024 at 2:00:00 PM GMT+2 */
export const formatMediumDateTime: DateFormatter = (date) =>
  parseDate(date).toFormat('FFF');

/** @example Jul 7/22/2024, 14:00 */
export const formatShortDateTime: DateFormatter = (date) =>
  parseDate(date).toFormat('MMM D, T');

/** @example 2024-07-22T14:00 */
export const formatISOWithoutZone: DateFormatter = (date) =>
  parseDate(date).toFormat("yyyy-MM-dd'T'T");

/** @example July 2022 */
export const formatMonth: DateFormatter = (date) =>
  parseDate(date).toFormat('MMMM yyyy');
