import { getOfferingsList } from '@waldur/marketplace/common/api';

export const offeringsAutocomplete = (query: string, customerId?: string) => {
  const params: any = {
    name: query,
    field: ['name', 'uuid', 'category_title', 'thumbnail'],
    o: 'name',
    state: 'Active',
  };
  if (customerId) {
    params.customer_uuid = customerId;
  }
  return getOfferingsList(params).then(options => ({options}));
};
