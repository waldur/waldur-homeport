import { translate } from '@waldur/i18n';

const Frequency = {
  MINUTE: 1,
  HOUR: 2,
  DAY: 3,
  WEEK: 4,
  MONTH: 5,
  YEAR: 6,
};

export const parseCrontab = (value, allowMultiple) => {
  const cron = value.replace(/\s+/g, ' ').split(' ');
  // default: every minute
  const frequency = {
    base: 1,
    minuteValues: undefined,
    hourValues: undefined,
    dayOfMonthValues: undefined,
    monthValues: undefined,
    dayValues: undefined,
  };
  let tempArray = [];

  if (cron[0] === '*' && cron[1] === '*' && cron[2] === '*' && cron[3] === '*' && cron[4] === '*') {
      frequency.base = Frequency.MINUTE; // every minute
  } else if (cron[1] === '*' && cron[2] === '*' && cron[3] === '*' && cron[4] === '*') {
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
      // preparing to handle multiple minutes
      if (allowMultiple) {
          tempArray = cron[0].split(',');
          for (let i = 0; i < tempArray.length; i++) { tempArray[i] = +tempArray[i]; }
          frequency.minuteValues = tempArray;
      } else {
          frequency.minuteValues = parseInt(cron[0], 10);
      }
  }
  if (cron[1] !== '*') {
      // preparing to handle multiple hours
      if (allowMultiple) {
          tempArray = cron[1].split(',');
          for (let i = 0; i < tempArray.length; i++) { tempArray[i] = +tempArray[i]; }
          frequency.hourValues = tempArray;
      } else {
          frequency.hourValues = parseInt(cron[1], 10);
      }
  }
  if (cron[2] !== '*') {
      // preparing to handle multiple days of the month
      if (allowMultiple) {
          tempArray = cron[2].split(',');
          for (let i = 0; i < tempArray.length; i++) { tempArray[i] = +tempArray[i]; }
          frequency.dayOfMonthValues = tempArray;
      } else {
          frequency.dayOfMonthValues = parseInt(cron[2], 10);
      }
  }
  if (cron[3] !== '*') {
      // preparing to handle multiple months
      if (allowMultiple) {
          tempArray = cron[3].split(',');
          for (let i = 0; i < tempArray.length; i++) { tempArray[i] = +tempArray[i]; }
          frequency.monthValues = tempArray;
      } else {
          frequency.monthValues = parseInt(cron[3], 10);
      }
  }
  if (cron[4] !== '*') {
      // preparing to handle multiple days of the week
      if (allowMultiple) {
          tempArray = cron[4].split(',');
          for (let i = 0; i < tempArray.length; i++) { tempArray[i] = +tempArray[i]; }
          frequency.dayValues = tempArray;
      } else {
          frequency.dayValues = parseInt(cron[4], 10);
      }
  }
  return frequency;
};

const cronDayName = input => {
  const days = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
  };
  if (input !== null && days[input]) {
      return days[input];
  } else {
      return null;
  }
};

const cronMonthName = input => {
  const months = {
    1: 'January',
    2: 'February',
    3: 'March',
    4: 'April',
    5: 'May',
    6: 'June',
    7: 'July',
    8: 'August',
    9: 'September',
    10: 'October',
    11: 'November',
    12: 'December',
  };
  if (input !== null && months[input]) {
    return months[input];
  } else {
      return null;
  }
};

const cronNumeral = input => {
  switch (input) {
    case 1:
      return '1st';
    case 2:
      return '2nd';
    case 3:
      return '3rd';
    case 21:
      return '21st';
    case 22:
      return '22nd';
    case 23:
      return '23rd';
    case 31:
      return '31st';
    case null:
      return null;
    default:
      return input + 'th';
  }
};

export const formatCrontab = crontab => {
  const schedule = parseCrontab(crontab, false);
  const { base, minuteValues, hourValues, dayOfMonthValues, dayValues, monthValues } = schedule;
  const zeroPad = value => value < 10 ? '0' + value : String(value);

  const formatTime = () => `${zeroPad(hourValues)}:${zeroPad(minuteValues)}`;
  const formatDay = () => cronDayName(dayValues);
  const formatMonth = () => cronMonthName(monthValues);
  const formatNumeral = () => cronNumeral(dayOfMonthValues);

  switch (base) {
  case Frequency.MINUTE:
    return translate('Every minute');

  case Frequency.HOUR:
    if (minuteValues) {
      return translate('Every hour at {minuteValues} past the hour', {minuteValues});
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
      return translate('Every week on {day} at {time}',
        { day: formatDay(), time: formatTime() });
    } else {
      return translate('Every week');
    }

  case Frequency.MONTH:
    if (dayOfMonthValues !== undefined) {
      return translate('Every month on the {days} at {time}',
        { days: formatNumeral(), time: formatTime() });
    } else {
      return translate('Every month');
    }

  case Frequency.YEAR:
    if (dayOfMonthValues !== undefined) {
      return translate('Every month on the {days} of {months} at {time}',
        { days: formatNumeral(), months: formatMonth(), time: formatTime() });
    } else {
      return translate('Every year');
    }

  default:
    return crontab;
  }
};
