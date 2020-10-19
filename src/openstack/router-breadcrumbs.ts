import { gettext } from '@waldur/i18n';
import { ResourceBreadcrumbsRegistry } from '@waldur/resource/breadcrumbs/ResourceBreadcrumbsRegistry';

import { getTenantListState } from './utils';

ResourceBreadcrumbsRegistry.register('OpenStack.Router', (resource) => {
  return [
    getTenantListState(resource.project_uuid),
    {
      label: resource.tenant_name,
      state: 'resource-details',
      params: {
        uuid: resource.tenant_uuid,
        resource_type: 'OpenStack.Tenant',
      },
    },
    {
      label: gettext('Routers'),
      state: 'resource-details',
      params: {
        uuid: resource.tenant_uuid,
        resource_type: 'OpenStack.Tenant',
        tab: 'routers',
      },
    },
  ];
});
