import { formatDateTime } from '@waldur/core/dateUtils';

export const FILESIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

export const formatFilesize = (input, fromUnit = 'MB', toUnit = 'B') => {
  if (isNaN(parseFloat(input)) || !isFinite(input)) {
    return '?';
  }

  if (input === -1) {
    return '∞';
  }

  if (input === 0) {
    return input;
  }

  let startUnit = FILESIZE_UNITS.indexOf(fromUnit);
  let endUnit = FILESIZE_UNITS.indexOf(toUnit);
  if (startUnit === -1) {
    return '?';
  }
  if (endUnit <= startUnit) {
    endUnit = -1;
  }

  while ( endUnit === -1 ? input >= 1024 : endUnit > startUnit) {
    input /= 1024;
    startUnit++;
  }

  return Math.floor(input * 10) / 10 + ' ' + FILESIZE_UNITS[startUnit];
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

export const dictToList = dict => {
  const list = [];
  for (const key in dict) {
    if (!dict.hasOwnProperty(key)) { continue; }
    list.push(dict[key]);
  }
  return list;
};

export const getUUID = url => url.split('/').splice(-2)[0];

export const minutesToHours = input => {
  if (isNaN(parseInt(input, 10)) || !isFinite(input)) {
    return '?';
  }

  if (input === -1) {
    return '∞';
  }

  const hours = input / 60;
  return hours.toFixed(2) + ' H';
};

export const pick = fields => source =>
  fields.reduce((target, field) => ({ ...target, [field]: source[field] }), {});

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

export const omit = (object, prop) => {
  if (prop in object) {
    const { [prop]: _, ...rest } = object;
    return rest;
  } else {
    return object;
  }
};

export const toKeyValue = obj =>
  Object.keys(obj).map(key => `${key}=${encodeURIComponent(obj[key])}`).join('&');

export const LATIN_NAME_PATTERN = new RegExp('^[A-Za-z][A-Za-z0-9-._ ()]+$');

export const range = n => Array.from(Array(n).keys());

export function parseQueryString(qs) {
  // Example input: foo=123&bar=456
  // Example output: {foo: "123", bar: "456"}

  return qs.split('&').reduce((result, part) => {
    const tokens = part.split('=');
    if (tokens.length > 1) {
      const key = tokens[0];
      const value = tokens[1];
      result[key] = value;
    }
    return result;
  }, {});
}

export const isEmpty = obj => Object.keys(obj).length === 0;
