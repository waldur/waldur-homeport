import { getPublicOfferingsList } from '../common/api';

export const fetchLastNOfferings = async ({
  page_size = 5,
  customer = null,
  project = null,
} = {}) => {
  const offerings = await getPublicOfferingsList({
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
    allowed_customer_uuid: customer?.uuid,
    project_uuid: project?.uuid,
  });
  return offerings;
};
