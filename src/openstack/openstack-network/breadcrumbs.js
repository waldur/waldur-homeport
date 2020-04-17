import { getUUID } from '@waldur/core/utils';

import { getTenantListState } from '../utils';

// @ngInject
export default function breadcrumbsConfig(ResourceBreadcrumbsService) {
  ResourceBreadcrumbsService.register('OpenStack.Network', resource => {
    const tenant_uuid = getUUID(resource.tenant);
    return [
      getTenantListState(resource.project_uuid),
      {
        label: resource.tenant_name,
        state: 'resources.details',
        params: {
          uuid: tenant_uuid,
          resource_type: 'OpenStack.Tenant',
        },
      },
      {
        label: gettext('Networks'),
        state: 'resources.details',
        params: {
          uuid: tenant_uuid,
          resource_type: 'OpenStack.Tenant',
          tab: 'networks',
        },
      },
    ];
  });
}
