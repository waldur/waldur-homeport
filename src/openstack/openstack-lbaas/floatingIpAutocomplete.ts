import { openstackFloatingIpsList } from 'waldur-js-client';

import { createLoadOptions } from '@/form/select';

export const floatingIpAutocomplete = (tenantUuid: string) =>
  createLoadOptions(openstackFloatingIpsList, 'address', {
    tenant_uuid: tenantUuid,
    field: ['uuid', 'url', 'address', 'name'],
  });
