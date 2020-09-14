import { translate } from '@waldur/i18n';

const moment = require('moment-timezone');

export const Frequency = {
  MINUTE: 'minute',
  HOUR: 'hour',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
};

export const parseCrontab = (value: string) => {
  const cron = value.replace(/\s+/g, ' ').split(' ');
  // default: every minute
  const frequency = {
    base: Frequency.MINUTE,
    minuteValues: undefined,
    hourValues: undefined,
    dayOfMonthValues: undefined,
    monthValues: undefined,
    dayValues: undefined,
  };

  if (
    cron[0] === '*' &&
    cron[1] === '*' &&
    cron[2] === '*' &&
    cron[3] === '*' &&
    cron[4] === '*'
  ) {
    frequency.base = Frequency.MINUTE; // every minute
  } else if (
    cron[1] === '*' &&
    cron[2] === '*' &&
    cron[3] === '*' &&
    cron[4] === '*'
  ) {
    frequency.base = Frequency.HOUR; // every hour
  } else if (cron[2] === '*' && cron[3] === '*' && cron[4] === '*') {
    frequency.base = Frequency.DAY; // every day
  } else if (cron[2] === '*' && cron[3] === '*') {
    frequency.base = Frequency.WEEK; // every week
  } else if (cron[3] === '*' && cron[4] === '*') {
    frequency.base = Frequency.MONTH; // every month
  } else if (cron[4] === '*') {
    frequency.base = Frequency.YEAR; // every year
  }

  if (cron[0] !== '*') {
    frequency.minuteValues = parseInt(cron[0], 10);
  }

  if (cron[1] !== '*') {
    frequency.hourValues = parseInt(cron[1], 10);
  }

  if (cron[2] !== '*') {
    frequency.dayOfMonthValues = parseInt(cron[2], 10);
  }

  if (cron[3] !== '*') {
    frequency.monthValues = parseInt(cron[3], 10);
  }

  if (cron[4] !== '*') {
    frequency.dayValues = parseInt(cron[4], 10);
  }

  return frequency;
};

export const cronDayName = (input) => moment().day(input).format('dddd');

export const cronMonthName = (input) =>
  moment()
    .month(input - 1)
    .format('MMMM');

export const cronNumeral = (input) => moment.localeData().ordinal(input);

export const formatCrontab = (crontab) => {
  const schedule = parseCrontab(crontab);
  const {
    base,
    minuteValues,
    hourValues,
    dayOfMonthValues,
    dayValues,
    monthValues,
  } = schedule;
  const zeroPad = (value) => (value < 10 ? '0' + value : String(value));

  const formatTime = () => `${zeroPad(hourValues)}:${zeroPad(minuteValues)}`;
  const formatDay = () => cronDayName(dayValues);
  const formatMonth = () => cronMonthName(monthValues);
  const formatNumeral = () => cronNumeral(dayOfMonthValues);

  switch (base) {
    case Frequency.MINUTE:
      return translate('Every minute');

    case Frequency.HOUR:
      if (minuteValues) {
        return translate('Every hour at {minuteValues} past the hour', {
          minuteValues,
        });
      } else {
        return translate('Every hour');
      }

    case Frequency.DAY:
      if (hourValues !== undefined) {
        return `${translate('Every day at')} ${formatTime()}`;
      } else {
        return translate('Every day');
      }

    case Frequency.WEEK:
      if (dayValues !== undefined) {
        return translate('Every week on {day} at {time}', {
          day: formatDay(),
          time: formatTime(),
        });
      } else {
        return translate('Every week');
      }

    case Frequency.MONTH:
      if (dayOfMonthValues !== undefined) {
        return translate('Every month on the {days} at {time}', {
          days: formatNumeral(),
          time: formatTime(),
        });
      } else {
        return translate('Every month');
      }

    case Frequency.YEAR:
      if (dayOfMonthValues !== undefined) {
        return translate('Every month on the {days} of {months} at {time}', {
          days: formatNumeral(),
          months: formatMonth(),
          time: formatTime(),
        });
      } else {
        return translate('Every year');
      }

    default:
      return crontab;
  }
};

export const serializeCron = (input) => {
  const cron = ['*', '*', '*', '*', '*'];

  if (
    [
      Frequency.HOUR,
      Frequency.DAY,
      Frequency.WEEK,
      Frequency.MONTH,
      Frequency.YEAR,
    ].includes(input?.base)
  ) {
    cron[0] = input.minuteValues || 0;
  }

  if (
    [Frequency.DAY, Frequency.WEEK, Frequency.MONTH, Frequency.YEAR].includes(
      input?.base,
    )
  ) {
    cron[1] = input.hourValues || 0;
  }

  if (input?.base === Frequency.WEEK) {
    cron[4] = input.dayValues || 0;
  }

  if ([Frequency.MONTH, Frequency.YEAR].includes(input?.base)) {
    cron[2] = input.dayOfMonthValues || 1;
  }

  if (input?.base === Frequency.YEAR) {
    cron[3] =
      typeof input.monthValues !== 'undefined' ? input.monthValues : '*';
  }
  return cron.join(' ');
};
