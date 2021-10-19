import { DateTime } from 'luxon';

type DateInput = DateTime | Date | string | number | number[];

type DateFormatter = (date: DateInput) => string;

export const parseDate = (value: DateInput) => {
  if (value instanceof DateTime) {
    return value;
  } else if (typeof value === 'undefined') {
    return DateTime.now();
  } else if (typeof value === 'string') {
    return DateTime.fromISO(value);
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

export const formatDate: DateFormatter = (date) => parseDate(date).toISODate();

export const formatDateTime: DateFormatter = (date) =>
  parseDate(date).toFormat('yyyy-MM-dd T');

export const formatTime: DateFormatter = (date) =>
  parseDate(date).toFormat('T');

export const formatRelative: DateFormatter = (date) =>
  parseDate(date).toRelative();

export const formatMediumDateTime: DateFormatter = (date) =>
  parseDate(date).toFormat('FFF');

export const formatShortDateTime: DateFormatter = (date) =>
  parseDate(date).toFormat('MMM D, T');
