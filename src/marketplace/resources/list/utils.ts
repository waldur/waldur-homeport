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
