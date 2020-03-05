import { defaultCurrency } from '@waldur/core/services';
import { titleCase, formatFilesize } from '@waldur/core/utils';

import { QUOTA_NAMES, QUOTA_FILTERS } from './constants';

export const formatQuotaName = name => {
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
