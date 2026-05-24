import { ENV } from '@/core/config';
import { DEFAULT_PRIMARY_COLORS } from '@/core/constants';
import { PhoneNumber } from '@/workspace/types';

export const getBrandColor = () =>
  ENV.plugins?.WALDUR_CORE.BRAND_COLOR || DEFAULT_PRIMARY_COLORS[600];

export function wait(amount = 0) {
  return new Promise((resolve) => setTimeout(resolve, amount));
}

const FILESIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

export const formatFilesize = (
  input,
  fromUnit = 'MB',
  toUnit = 'B',
  customSuffix = '',
) => {
  if (isNaN(parseFloat(input)) || !isFinite(input)) {
    return '?';
  }

  if (input === -1) {
    return '∞';
  }

  if (input === 0) {
    return input;
  }

  if (input < 0) {
    input *= -1;
  }

  let startUnit = FILESIZE_UNITS.indexOf(fromUnit);
  let endUnit = FILESIZE_UNITS.indexOf(toUnit);
  if (startUnit === -1) {
    return '?';
  }
  if (endUnit <= startUnit) {
    endUnit = -1;
  }

  while (endUnit === -1 ? input >= 1024 : endUnit > startUnit) {
    input /= 1024;
    startUnit++;
  }

  return (
    Math.floor(input * 10) / 10 + ' ' + FILESIZE_UNITS[startUnit] + customSuffix
  );
};

const SNAKE_CASE_REGEXP = /[A-Z]/g;

export const formatSnakeCase = (input) =>
  input.replace(
    SNAKE_CASE_REGEXP,
    (letter, pos) => (pos ? '-' : '') + letter.toLowerCase(),
  );

export const getAbbreviation = (text: string, length = 0) => {
  const abbr = text.replace(/(\w)\w*\W*/g, (_, i) => i.toUpperCase());
  return length > 0 ? abbr.substring(0, length) : abbr;
};

/**
 * Formats a phone number for human-readable display following E.123 international notation.
 * E.123 is the ITU-T recommendation for formatting telephone numbers.
 *
 * Examples:
 * - { country_code: '+1', national_number: '2025551234' } => '+1 202 555 1234'
 * - { country_code: '44', national_number: '7911123456' } => '+44 791 112 3456'
 * - '+12025551234' => '+1 202 555 1234'
 */
export const formatPhoneNumber = (phoneNumber: PhoneNumber): string | null => {
  if (!phoneNumber) return null;

  let countryCode: string;
  let nationalNumber: string;

  if (typeof phoneNumber === 'string') {
    // Try to parse string format - check if it starts with + or digits
    const cleaned = phoneNumber.replace(/[\s\-().]/g, '');
    if (!cleaned) return null;

    // If it starts with +, extract country code (assume 1-3 digits after +)
    if (cleaned.startsWith('+')) {
      // Simple heuristic: +1 for NANP, +XX or +XXX for others
      if (cleaned.startsWith('+1') && cleaned.length > 2) {
        countryCode = '+1';
        nationalNumber = cleaned.slice(2);
      } else {
        // Try 2-digit country code first, then 3-digit
        countryCode = cleaned.slice(0, 3);
        nationalNumber = cleaned.slice(3);
        if (nationalNumber.length < 6) {
          countryCode = cleaned.slice(0, 4);
          nationalNumber = cleaned.slice(4);
        }
      }
    } else {
      // No country code, just format the number
      nationalNumber = cleaned;
      countryCode = '';
    }
  } else {
    countryCode = phoneNumber.country_code || '';
    nationalNumber = phoneNumber.national_number || '';

    // Ensure country code starts with +
    if (countryCode && !countryCode.startsWith('+')) {
      countryCode = '+' + countryCode;
    }
  }

  // Clean national number of any non-digits
  nationalNumber = nationalNumber.replace(/\D/g, '');

  if (!nationalNumber) return countryCode || null;

  // Format national number in groups of 3-4 digits for readability
  // Common pattern: XXX XXX XXXX for 10 digits, or groups of 3 for others
  const formatNationalNumber = (num: string): string => {
    const len = num.length;
    if (len <= 4) return num;
    if (len <= 7) return `${num.slice(0, 3)} ${num.slice(3)}`;
    if (len <= 10)
      return `${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6)}`;
    // For longer numbers, group in threes from the end
    const parts: string[] = [];
    let i = len;
    while (i > 0) {
      const start = Math.max(0, i - 3);
      parts.unshift(num.slice(start, i));
      i = start;
    }
    return parts.join(' ');
  };

  const formattedNational = formatNationalNumber(nationalNumber);

  return countryCode
    ? `${countryCode} ${formattedNational}`
    : formattedNational;
};

export const listToDict = (key, value) => (list) => {
  const dict = {};
  list.forEach((item) => {
    dict[key(item)] = value(item);
  });
  return dict;
};

export const getUUID = (url) => url && url.split('/').splice(-2)[0];

export const pick = (fields) => (source) =>
  fields.reduce((target, field) => ({ ...target, [field]: source[field] }), {});

// This is a list of words that should not be lowercased
const EXCEPTIONS: Record<string, string> = {
  url: 'URL',
  id: 'ID',
  api: 'API',
};

export const titleCase = (input: string) => {
  if (!input) return input;

  const words = input
    .split(' ')
    .map((word) => EXCEPTIONS[word.toLowerCase()] || word.toLowerCase());

  // Capitalize only the first word
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);

  return words.join(' ');
};

export const omit = (object, prop) => {
  if (prop in object) {
    const { [prop]: _, ...rest } = object;
    return rest;
  } else {
    return object;
  }
};

export const LATIN_NAME_PATTERN = new RegExp('^[A-Za-z][A-Za-z0-9-._ ()]+$');

export const range = (n) => Array.from(Array(n).keys());

export function getQueryString() {
  // Example input: http://example.com/approve/?foo=123&bar=456
  // Example output: foo=123&bar=456

  const parts = document.location.search.split('?');
  if (parts.length > 1) {
    return parts[1];
  }
  return '';
}

export const isEmpty = (obj) => !obj || Object.keys(obj).length === 0;

const entityMap = {
  '<': '&lt;',
  '>': '&gt;',
};

// Based on https://github.com/janl/mustache.js/blob/v3.1.0/mustache.js#L73-L88
export function escapeHtml(str) {
  return String(str).replace(/[<>]/g, function fromEntityMap(s) {
    return entityMap[s];
  });
}

// Taken from https://stackoverflow.com/questions/5723154
export const truncate = (fullStr: string, strLen = 30, separator = '...') => {
  if (fullStr.length <= strLen) return fullStr;

  const sepLen = separator.length,
    charsToShow = strLen - sepLen,
    frontChars = Math.ceil(charsToShow / 2),
    backChars = Math.floor(charsToShow / 2);

  return (
    fullStr.substring(0, frontChars) +
    separator +
    fullStr.substring(fullStr.length - backChars)
  );
};

export const cleanObject = (value: any) => JSON.parse(JSON.stringify(value));

export const createDeferred = () => {
  const deferred: any = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
};

export const orderByFilter = (sorting: {
  mode: 'asc' | 'desc';
  field: string;
}): string => `${sorting.mode === 'desc' ? '-' : ''}${sorting.field}`;

/**
 *
 * @param obj
 * @returns flatten object
 * @example
 * const x = {a: {z: "z1", x: "x1"}, b: "b1"};
 * flattenObject(x) === {'a.z': "z1", 'a.x': "x1", b: "b1"}
 */
export const flattenObject = (obj): Record<string, any> => {
  const result = {};

  for (const i in obj) {
    if (typeof obj[i] === 'object' && !Array.isArray(obj[i])) {
      const temp = flattenObject(obj[i]);
      for (const j in temp) {
        result[i + '.' + j] = temp[j];
      }
    } else {
      result[i] = obj[i];
    }
  }
  return result;
};

export const detectOS = () => {
  const nAgt = window.navigator.userAgent;
  let os = 'Unknown';
  if (/(Windows|Win)/.test(nAgt)) {
    os = 'Windows';
  }
  return os;
};

export const decodeFileName = (fileName: string) => {
  const name = fileName.split('/').pop();
  // Remove hash suffix added by backend (e.g., logo_tYFDZbD.png -> logo.png)
  // Pattern: underscore followed by 7 alphanumeric characters before the extension
  return decodeURIComponent(name.replace(/_[a-zA-Z0-9]{7}\./, '.'));
};

/**
 * Generates a random UUID v4.
 * Uses crypto.randomUUID() when available, falls back to a polyfill for older browsers.
 */
export const randomUUID = (): string => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers (e.g., Chrome < 92)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
