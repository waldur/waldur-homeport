import { getAll } from '@waldur/core/api';
import { getCategory } from '@waldur/marketplace/common/api';

import { OfferingChoice } from './types';

export async function loadData(category_uuid, project_uuid) {
  const category = await getCategory(category_uuid, {
    params: { field: ['columns', 'title'] },
  });
  const offerings = await getAll<OfferingChoice>(
    `/marketplace-resource-offerings/${project_uuid}/${category_uuid}/`,
  );

  return {
    columns: category.columns,
    title: category.title,
    offerings,
  };
}

export const resourcesListRequiredFields = () => [
  'uuid',
  'name',
  'attributes',
  'end_date',
  'created',
  'offering_name',
  'offering_type',
  'backend_metadata',
  'backend_id',
  'state',
  'scope',
  'report',
  'plan_uuid',
  'plan_name',
  'marketplace_plan_uuid',
  'is_limit_based',
  'provider_uuid',
  'project_uuid',
  'customer_uuid',
  'category_title',
  'description',
  'can_terminate',
  'resource_type',
  'resource_uuid',
];
