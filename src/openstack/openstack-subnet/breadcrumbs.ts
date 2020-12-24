import { getUUID } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { ResourceBreadcrumbsRegistry } from '@waldur/resource/breadcrumbs/ResourceBreadcrumbsRegistry';

import { getTenantListState } from '../utils';

ResourceBreadcrumbsRegistry.register('OpenStack.SubNet', (resource) => {
  const tenant_uuid = getUUID(resource.tenant);
  const network_uuid = getUUID(resource.network);
  return [
    getTenantListState(resource.project_uuid),
    {
      label: resource.tenant_name,
      state: 'resource-details',
      params: {
        uuid: tenant_uuid,
        resource_type: 'OpenStack.Tenant',
      },
    },
    {
      label: translate('Networks'),
      state: 'resource-details',
      params: {
        uuid: tenant_uuid,
        resource_type: 'OpenStack.Tenant',
        tab: 'networks',
      },
    },
    {
      label: resource.network_name,
      state: 'resource-details',
      params: {
        uuid: network_uuid,
        resource_type: 'OpenStack.Network',
      },
    },
    {
      label: translate('Subnets'),
      state: 'resource-details',
      params: {
        uuid: network_uuid,
        resource_type: 'OpenStack.Network',
        tab: 'subnets',
      },
    },
  ];
});
