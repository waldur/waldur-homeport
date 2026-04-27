import { marketplaceResourcesRetrieve, Resource } from 'waldur-js-client';

import { get } from '@/core/api';

export async function loadData(url: string) {
  try {
    const resource = await get<{ marketplace_resource_uuid }>(url);
    let marketplaceResource: Resource;
    if (resource.marketplace_resource_uuid) {
      marketplaceResource = await marketplaceResourcesRetrieve({
        path: { uuid: resource.marketplace_resource_uuid },
      }).then((r) => r.data);
    }
    return { resource, marketplaceResource };
  } catch (error) {
    throw new Error(error);
  }
}
