// @ngInject
export default function breadcrumbsConfig(ResourceBreadcrumbsService, ncUtils, CATEGORY_ITEMS) {
  ResourceBreadcrumbsService.register('OpenStack.Network', resource => {
    const tenant_uuid = ncUtils.getUUID(resource.tenant);
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
    ];
  });
}
