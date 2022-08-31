import { getOfferingsList } from '../common/api';

export const fetchLastNOfferings = async (page_size = 5) => {
  const offerings = await getOfferingsList({
    page: 1,
    page_size,
    field: [
      'uuid',
      'category_uuid',
      'customer_uuid',
      'category_title',
      'name',
      'description',
      'image',
      'state',
      'paused_reason',
    ],
    state: ['Active', 'Paused'],
    o: '-created',
  });
  return offerings;
};
