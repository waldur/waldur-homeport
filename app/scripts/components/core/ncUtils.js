import { formatRelative } from './dateUtils';
import { getUUID } from './utils';

function getPrettyQuotaName(name) {
  return name.replace(/nc_|_count/g, '').replace(/_/g, ' ');
}

function isCustomerQuotaReached(customer, quotaName) {
  let quotas = customer.quotas || [];
  for (let i = 0; i < quotas.length; i++) {
    let value = quotas[i];
    let name = this.getPrettyQuotaName(value.name);
    if (name === quotaName && value.limit > -1 && (value.limit === value.usage || value.limit === 0)) {
      return {name: name, usage: [value.limit, value.usage]};
    }
  }
  return false;
}

function getQuotaUsage(quotas) {
  let usage = {};
  for (let i = 0; i < quotas.length; i++) {
    let quota = quotas[i];
    usage[quota.name] = Math.max(0, quota.usage);
  }
  return usage;
}

function getQueryString() {
  // Example input: http://example.com/#/approve/?foo=123&bar=456
  // Example output: foo=123&bar=456

  let hash = document.location.hash;
  let parts = hash.split('?');
  if (parts.length > 1) {
    return parts[1];
  }
  return '';
}

function renderLink(href, name) {
  return `<a href="${href}">${name}</a>`;
}

function renderAvatar(user) {
  const avatar = `<img gravatar-src="${user.email}" gravatar-size="100" class="avatar-img img-xs">`;
  return avatar + ' ' + (user.full_name || user.username);
}

function booleanField(value) {
  const cls = value ? 'fa-check' : 'fa-minus';
  return `<a class="bool-field"><i class="fa ${cls}"/></a>`;
}

function parseQueryString(qs) {
  // Example input: foo=123&bar=456
  // Example output: {foo: "123", bar: "456"}

  return qs.split('&').reduce(function(result, part){
    let tokens = part.split('=');
    if (tokens.length > 1) {
      let key = tokens[0];
      let value = tokens[1];
      result[key] = value;
    }
    return result;
  }, {});
}

function toKeyValue (obj) {
  const parts = [];
  Object.keys(obj).forEach(function(value, key) {
    parts.push(key + '=' + encodeURIComponent(value));
  });
  return parts.length ? parts.join('&') : '';
}

function mergeLists(list1, list2, fieldIdentifier) {
  list1 = list1 || [];
  list2 = list2 || [];
  fieldIdentifier = fieldIdentifier || 'uuid';
  let itemByUuid = {},
    newListUiids = list2.map(function(item) {
      return item[fieldIdentifier];
    });
  for (let i = 0; i < list1.length; i++) {
    let item = list1[i];
    itemByUuid[item[fieldIdentifier]] = item;
  }

  // Remove stale items
  list1 = list1.filter(function(item) {
    return newListUiids.indexOf(item[fieldIdentifier]) !== -1;
  });

  // Add or update remaining items
  for (let i = 0; i < list2.length; i++) {
    let item2 = list2[i];
    let item1 = itemByUuid[item2[fieldIdentifier]];
    if (!item1) {
      list1.push(item2);
      continue;
    }
    for (let key in item2) {
      item2.hasOwnProperty(key) && (item1[key] = item2[key]);
    }
  }
  return list1;
}

function sortObj(obj, order) {
  let i,
    tempArry = Object.keys(obj),
    tempObj = {};

  tempArry.sort(
    function(a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    }
  );

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
  let vm = this;
  vm.field = field;
  vm.desc = desc;
  function compare(a,b) {
    if (a[vm.field] < b[vm.field])
      return desc ? 1 : -1;
    else if (a[vm.field] > b[vm.field])
      return !desc ? 1 : -1;
    else
      return 0;
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
