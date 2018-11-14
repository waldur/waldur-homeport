import { getOfferingsList } from '@waldur/marketplace/common/api';

export const offeringsAutocomplete = (query: object) => {
  const params = {
    field: ['name', 'uuid', 'category_title', 'thumbnail'],
    o: 'name',
    state: 'Active',
    ...query,
  };
  return getOfferingsList(params).then(options => ({options}));
};
