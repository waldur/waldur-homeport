// @ngInject
export default function breadcrumbsConfig(ResourceBreadcrumbsService, ncUtils, CATEGORY_ITEMS) {
  ResourceBreadcrumbsService.register('OpenStack.SubNet', resource => {
    const tenant_uuid = ncUtils.getUUID(resource.tenant);
    const network_uuid = ncUtils.getUUID(resource.network);
    return [
      {
        label: CATEGORY_ITEMS.private_clouds.label,
        state: CATEGORY_ITEMS.private_clouds.state,
        params: {
          uuid: resource.project_uuid
        }
      },
      {
        label: resource.tenant_name,
        state: 'resources.details',
        params: {
          uuid: tenant_uuid,
          resource_type: 'OpenStack.Tenant'
        }
      },
      {
        label: gettext('Networks'),
        state: 'resources.details',
        params: {
          uuid: tenant_uuid,
          resource_type: 'OpenStack.Tenant',
          tab: 'networks'
        }
      },
      {
        label: resource.network_name,
        state: 'resources.details',
        params: {
          uuid: network_uuid,
          resource_type: 'OpenStack.Network'
        }
      },
      {
        label: gettext('Subnets'),
        state: 'resources.details',
        params: {
          uuid: network_uuid,
          resource_type: 'OpenStack.Network',
          tab: 'subnets'
        }
      },
    ];
  });
}
