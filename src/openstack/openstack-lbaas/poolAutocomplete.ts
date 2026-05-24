import { openstackPoolsList } from 'waldur-js-client';

import { createLoadOptions } from '@/form/select';

export const poolAutocomplete = (loadBalancerUuid: string) =>
  createLoadOptions(openstackPoolsList, 'name', {
    load_balancer_uuid: loadBalancerUuid,
    field: ['uuid', 'name'],
  });
