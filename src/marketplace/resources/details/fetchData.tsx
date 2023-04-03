import { get } from '@waldur/core/api';
import {
  getResource,
  getResourceOffering,
} from '@waldur/marketplace/common/api';

export const fetchData = async (resourceId) => {
  const resource = await getResource(resourceId);
  let scope;
  if (resource.scope) {
    scope = await get(resource.scope).then((response) => response.data);
  }
  const offering = await getResourceOffering(resource.uuid);
  const components = offering.components;

  return { resource, scope, components, offering };
};
