import { openstackRoutersList } from 'waldur-js-client';

import { createLoadOptions } from '@/form/select';

export const routerAutocomplete = (tenantUuid: string) =>
  createLoadOptions(openstackRoutersList, 'name', {
    tenant_uuid: tenantUuid,
    state: ['OK'],
  });
