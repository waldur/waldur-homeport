import {formatDateTime} from '@waldur/core/dateUtils';

export const FILESIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

export const formatFilesize = (input, fromUnit = 'MB') => {
  if (isNaN(parseFloat(input)) || ! isFinite(input)) {
    return '?';
  }

  if (input === -1) {
    return '∞';
  }

  if (input === 0) {
    return input;
  }

  let unit = FILESIZE_UNITS.indexOf(fromUnit);
  if (unit === -1) {
    return '?';
  }

  while (input >= 1024) {
    input /= 1024;
    unit++;
  }

  return Math.floor(input * 10) / 10 + ' ' + FILESIZE_UNITS[unit];
};

const SNAKE_CASE_REGEXP = /[A-Z]/g;

export const formatSnakeCase = input =>
  input.replace(SNAKE_CASE_REGEXP, (letter, pos) =>
    (pos ? '-' : '') + letter.toLowerCase());

export const flatten = lists => Array.prototype.concat.apply([], lists);

export const listToDict = (key, value) => list => {
  const dict = {};
  list.forEach(item => {
    dict[key(item)] = value(item);
  });
  return dict;
};

export const getUUID = url => url.split('/').splice(-2)[0];

export const minutesToHours = input => {
  if (isNaN(parseInt(input, 10)) || ! isFinite(input)) {
    return '?';
  }

  if (input === -1) {
    return '∞';
  }

  const hours = input / 60;
  return hours.toFixed(2) + ' H';
};

export const pick = fields => source =>
  fields.reduce((target, field) => ({...target, [field]: source[field]}), {});

export const titleCase = input => {
  if (input) {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }
};

export const dateTime = input => {
  if (input) {
    return formatDateTime(input);
  }
};
