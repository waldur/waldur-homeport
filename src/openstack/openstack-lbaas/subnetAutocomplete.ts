import { openstackSubnetsList } from 'waldur-js-client';

import { createLoadOptions } from '@/form/select';

export const subnetAutocomplete = (tenantUuid: string) =>
  createLoadOptions(openstackSubnetsList, 'name', {
    tenant_uuid: tenantUuid,
    state: ['OK'],
    field: ['uuid', 'name', 'backend_id', 'cidr', 'network_name'],
  });
