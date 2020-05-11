import { gettext } from '@waldur/i18n';
import { ResourceBreadcrumbsRegistry } from '@waldur/resource/breadcrumbs/ResourceBreadcrumbsRegistry';

import { getTenantListState } from '../utils';

ResourceBreadcrumbsRegistry.register('OpenStack.SecurityGroup', resource => {
  return [
    getTenantListState(resource.project_uuid),
    {
      label: resource.tenant_name,
      state: 'resources.details',
      params: {
        uuid: resource.tenant_uuid,
        resource_type: 'OpenStack.Tenant',
      },
    },
    {
      label: gettext('Security groups'),
      state: 'resources.details',
      params: {
        uuid: resource.tenant_uuid,
        resource_type: 'OpenStack.Tenant',
        tab: 'security_groups',
      },
    },
  ];
});
