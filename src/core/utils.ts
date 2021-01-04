import { ENV } from '@waldur/configs/default';

export function wait(amount = 0) {
  return new Promise((resolve) => setTimeout(resolve, amount));
}

export const FILESIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

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

export const flatten = (lists) => Array.prototype.concat.apply([], lists);

export const listToDict = (key, value) => (list) => {
  const dict = {};
  list.forEach((item) => {
    dict[key(item)] = value(item);
  });
  return dict;
};

export const getUUID = (url) => url.split('/').splice(-2)[0];

export const minutesToHours = (input) => {
  if (isNaN(parseInt(input, 10)) || !isFinite(input)) {
    return '?';
  }

  if (input === -1) {
    return '∞';
  }

  const hours = input / 60;
  return hours.toFixed(2) + 'h';
};

export const pick = (fields) => (source) =>
  fields.reduce((target, field) => ({ ...target, [field]: source[field] }), {});

export const titleCase = (input) => {
  if (input) {
    return input.charAt(0).toUpperCase() + input.slice(1);
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

export const isEmpty = (obj) => Object.keys(obj).length === 0;

const entityMap = {
  '<': '&lt;',
  '>': '&gt;',
};

// Basrd on https://github.com/janl/mustache.js/blob/v3.1.0/mustache.js#L73-L88
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
    fullStr.substr(0, frontChars) +
    separator +
    fullStr.substr(fullStr.length - backChars)
  );
};

function getPrettyQuotaName(name) {
  return name.replace(/nc_|_count/g, '').replace(/_/g, ' ');
}

export function isCustomerQuotaReached(customer, quotaName) {
  const quotas = customer.quotas || [];
  for (const quota of quotas) {
    const name = getPrettyQuotaName(quota.name);
    if (
      name === quotaName &&
      quota.limit > -1 &&
      (quota.limit === quota.usage || quota.limit === 0)
    ) {
      return { name, usage: [quota.limit, quota.usage] };
    }
  }
  return false;
}

export function returnReactSelectAsyncPaginateObject<T = {}>(
  response: { options: T[]; totalItems: number },
  prevOptions,
  currentPage: number,
) {
  return {
    options: response.options,
    hasMore: response.totalItems > prevOptions.length + ENV.pageSize,
    additional: {
      page: currentPage + 1,
    },
  };
}

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
