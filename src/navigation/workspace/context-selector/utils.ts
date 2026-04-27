import { getAbbreviation } from '@/core/utils';

export const getItemAbbreviation = (item, key = null) => {
  if (typeof item !== 'object') {
    return item || '';
  }
  if (key && item[key]) {
    return item[key].toUpperCase().substring(0, 4);
  } else if (item.abbreviation) {
    return item.abbreviation.toUpperCase().substring(0, 4);
  } else if (item.name) {
    return getAbbreviation(item.name).substring(0, 4);
  } else if (item.customer_abbreviation) {
    return item.customer_abbreviation.toUpperCase().substring(0, 4);
  } else if (item.customer_name) {
    return item.customer_name.toUpperCase().substring(0, 4);
  }
  return '';
};
