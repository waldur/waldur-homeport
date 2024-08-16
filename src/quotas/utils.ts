import { defaultCurrency } from '@waldur/core/formatCurrency';
import { titleCase, formatFilesize } from '@waldur/core/utils';

import { QUOTA_NAMES, QUOTA_FILTERS } from './constants';
import { Quota } from './types';

export const formatQuotaName = (name) => {
  if (QUOTA_NAMES[name]) {
    return QUOTA_NAMES[name];
  }
  name = name.replace(/_/g, ' ');
  return titleCase(name);
};

export const formatQuotaValue = (value, name) => {
  if (value === -1) {
    return '∞';
  }
  const filter = QUOTA_FILTERS[name];
  if (filter) {
    switch (filter) {
      case 'filesize':
        return formatFilesize(value);
      case 'defaultCurrency':
        return defaultCurrency(value);
    }
  } else {
    return value;
  }
};

export const formatQuota = (quota: Quota) => {
  const formattedUsage = formatQuotaValue(quota.usage, quota.name);
  const formattedLimit = formatQuotaValue(quota.limit, quota.name);
  let usage, usageValue;
  if (formattedUsage === '∞') {
    usage = formattedUsage;
    usageValue = Infinity;
  } else {
    usage = String(formattedUsage).match(/\d+/)[0];
    usageValue = Number(usage);
  }
  let limitValue;
  const limit = formattedLimit;
  if (formattedLimit === '∞') {
    limitValue = Infinity;
  } else {
    limitValue = Number(String(formattedLimit).match(/\d+/)[0]);
  }
  return {
    name: quota.name,
    label: formatQuotaName(quota.name),
    usage,
    usageValue,
    limit,
    limitValue,
  };
};
