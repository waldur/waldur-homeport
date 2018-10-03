import {QUOTA_NAMES, QUOTA_FILTERS, QUOTA_TYPES} from './constants';

// @ngInject
export function quotaName($filter) {
  return function(name) {
    if (QUOTA_NAMES[name]) {
      return QUOTA_NAMES[name];
    }
    name = name.replace(/_/g, ' ');
    return $filter('titleCase')(name);
  };
}

// @ngInject
export function quotaValue($filter) {
  return function(value, name) {
    if (value === -1) {
      return '∞';
    }
    let filter = QUOTA_FILTERS[name];
    if (filter) {
      return $filter(filter)(value);
    } else {
      return value;
    }
  };
}

// @ngInject
export function quotaType($filter) {
  return function (type) {
    if (QUOTA_TYPES[type]) {
      return QUOTA_TYPES[type];
    } else {
      return $filter('titleCase')(type);
    }
  };
}
