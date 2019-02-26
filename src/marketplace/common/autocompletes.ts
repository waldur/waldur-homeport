import {
  getCustomerList,
  getServiceProviderList,
  getOfferingsList,
  getProjectList,
  getCategories
} from '@waldur/marketplace/common/api';

export const organizationAutocomplete = (query: string) => {
  const params = {
    name: query,
    field: ['name', 'uuid'],
    o: 'name',
  };
  return getCustomerList(params).then(options => ({options}));
};

export const projectAutocomplete = (customer: string) => (query: string) => {
  const params = {
    name: query,
    customer,
    field: ['name', 'uuid'],
    o: 'name',
  };
  return getProjectList(params).then(options => ({options}));
};

export const providerAutocomplete = (query: string) => {
  const params = {
    name: query,
    field: ['customer_name', 'customer_uuid'],
    o: 'customer_name',
  };
  return getServiceProviderList(params).then(options => ({options}));
};

export const categoryAutocomplete = (query: string) => {
  const params = {
    name: query,
    field: ['title', 'uuid'],
    o: 'title',
  };
  return getCategories(params).then(options => ({options}));
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
