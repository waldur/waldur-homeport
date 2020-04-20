import { getTenantListState } from '../utils';

// @ngInject
export default function breadcrumbsConfig(ResourceBreadcrumbsService) {
  ResourceBreadcrumbsService.register('OpenStack.FloatingIP', resource => {
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
        label: gettext('Floating IPs'),
        state: 'resources.details',
        params: {
          uuid: resource.tenant_uuid,
          resource_type: 'OpenStack.Tenant',
          tab: 'floating_ips',
        },
      },
    ];
  });
}
