import { getCustomerList, getServiceProviderList, getOfferingsList } from '@waldur/marketplace/common/api';

export const organizationAutocomplete = (query: string) => {
  const params = {
    name: query,
    field: ['name', 'uuid'],
    o: 'name',
  };
  return getCustomerList(params).then(options => ({options}));
};

export const providerAutocomplete = (query: string) => {
  const params = {
    name: query,
    field: ['customer_name', 'customer_uuid'],
    o: 'customer_name',
  };
  return getServiceProviderList(params).then(options => ({options}));
};

export const offeringsAutocomplete = (query: object) => {
  const params = {
    field: ['name', 'uuid', 'category_title', 'thumbnail'],
    o: 'name',
    state: 'Active',
    ...query,
  };
  return getOfferingsList(params).then(options => ({options}));
};
