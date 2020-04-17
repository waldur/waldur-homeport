import { getTenantListState } from '../utils';

// @ngInject
export default function breadcrumbsConfig(ResourceBreadcrumbsService) {
  ResourceBreadcrumbsService.register('OpenStack.SecurityGroup', resource => {
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
}
