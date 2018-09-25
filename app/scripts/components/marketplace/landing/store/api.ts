import { getOfferingsList } from '@waldur/marketplace/common/api';

export const offeringsAutocomplete = (query: string) => {
  const params = {
    name: query,
    field: ['name', 'uuid', 'category_title', 'thumbnail'],
    o: 'name',
  };
  return getOfferingsList(params).then(options => ({options}));
};
