import Axios from 'axios';

import { getResource } from '@waldur/marketplace/common/api';

import { Resource } from '../types';

export async function loadData(url: string) {
  try {
    const response = await Axios.get(url);
    const resource = response.data;
    let marketplaceResource: Resource;
    if (resource.marketplace_resource_uuid) {
      marketplaceResource = await getResource(
        resource.marketplace_resource_uuid,
      );
    }
    return { resource, marketplaceResource };
  } catch (error) {
    throw new Error(error);
  }
}
