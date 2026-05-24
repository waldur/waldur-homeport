import { openstackNetworksList } from 'waldur-js-client';

import { createLoadOptions } from '@/form/select';

export const networkAutocomplete = (tenantUuid: string) =>
  createLoadOptions(openstackNetworksList, 'name', {
    tenant_uuid: tenantUuid,
    state: ['OK'],
  });
