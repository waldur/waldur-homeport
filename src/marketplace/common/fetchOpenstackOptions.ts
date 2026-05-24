import { marketplaceResourcesList } from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { getStates } from '@/marketplace/resources/list/ResourceStateFilter';

export const fetchOpenstackOptions = (type: string, customerId?: string) =>
  createLoadOptions(marketplaceResourcesList, 'name', {
    field: ['name', 'backend_id', 'project_name'],
    customer_uuid: customerId,
    o: ['project_name', 'name'],
    state: getStates().map((state) => state.value),
    offering_type: type,
  });
