import { formatRelative } from './dateUtils';
import { $sanitize } from './services';
import { getUUID, toKeyValue, parseQueryString } from './utils';

function getPrettyQuotaName(name) {
  return name.replace(/nc_|_count/g, '').replace(/_/g, ' ');
}

export function isCustomerQuotaReached(customer, quotaName) {
  const quotas = customer.quotas || [];
  for (const quota of quotas) {
    const name = getPrettyQuotaName(quota.name);
    if (name === quotaName && quota.limit > -1 && (quota.limit === quota.usage || quota.limit === 0)) {
      return {name, usage: [quota.limit, quota.usage]};
    }
  }
  return false;
}

export function getQuotaUsage(quotas) {
  const usage = {};
  for (const quota of quotas) {
    usage[quota.name] = Math.max(0, quota.usage);
  }
  return usage;
}

function getQueryString() {
  // Example input: http://example.com/#/approve/?foo=123&bar=456
  // Example output: foo=123&bar=456

  const hash = document.location.hash;
  const parts = hash.split('?');
  if (parts.length > 1) {
    return parts[1];
  }
  return '';
}

function renderLink(href, name) {
  return `<a ng-non-bindable href="${href}">${$sanitize(name)}</a>`;
}

function renderAvatar(user) {
  const avatar = `<img gravatar-src="'${user.email}'" gravatar-size="100" class="avatar-img img-xs">`;
  return avatar + ' ' + $sanitize(user.full_name || user.username);
}

function booleanField(value) {
  const cls = value ? 'fa-check' : 'fa-minus';
  return `<a class="bool-field"><i class="fa ${cls}"/></a>`;
}

function mergeLists(list1, list2, fieldIdentifier) {
  list1 = list1 || [];
  list2 = list2 || [];
  fieldIdentifier = fieldIdentifier || 'uuid';
  const itemByUuid = {};
  const newListUuids = list2.map(item => {
    return item[fieldIdentifier];
  });
  for (const item of list1) {
    itemByUuid[item[fieldIdentifier]] = item;
  }

  // Remove stale items
  list1 = list1.filter(item => {
    return newListUuids.indexOf(item[fieldIdentifier]) !== -1;
  });

  // Add or update remaining items
  for (const item2 of list2) {
    const item1 = itemByUuid[item2[fieldIdentifier]];
    if (!item1) {
      list1.push(item2);
      continue;
    }
    for (const key in item2) {
      if (item2.hasOwnProperty(key)) {
        item1[key] = item2[key];
      }
    }
  }
  return list1;
}

function sortObj(obj, order) {
  let i;
  const tempArry = Object.keys(obj);
  const tempObj = {};

  tempArry.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  if (order === 'desc') {
    for (i = tempArry.length - 1; i >= 0; i--) {
      tempObj[tempArry[i]] = obj[tempArry[i]];
    }
  } else {
    for (i = 0; i < tempArry.length; i++) {
      tempObj[tempArry[i]] = obj[tempArry[i]];
    }
  }

  return tempObj;
}

function truncateTo(str, limit) {
  return str.length > limit ? str.slice(0, limit) + '..' : str;
}

// @param order - 0 for asc, 1 for desc
function sortArrayOfObjects(arr, field, desc) {
  function compare(a, b) {
    if (a[field] < b[field]) {
      return desc ? 1 : -1;
    } else if (a[field] > b[field]) {
      return !desc ? 1 : -1;
    } else {
      return 0;
    }
  }
  return arr.sort(compare);
}

export default () => ({
  getPrettyQuotaName,
  isCustomerQuotaReached,
  getQuotaUsage,
  getQueryString,
  relativeDate: formatRelative,
  getUUID,
  renderLink,
  renderAvatar,
  booleanField,
  parseQueryString,
  toKeyValue,
  mergeLists,
  sortObj,
  truncateTo,
  sortArrayOfObjects,
});
