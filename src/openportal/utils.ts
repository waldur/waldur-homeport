import { fixURL } from '@/core/api';

export const getCustomerURL = (customer) => {
  if (!customer) {
    return null;
  }

  if (customer.url) {
    return customer.url;
  }

  if (customer.uuid) {
    return fixURL(`/customers/${customer.uuid}/`);
  }

  return null;
};
