// @ngInject
export default function breadcrumbsConfig(
  ResourceBreadcrumbsService,
  CATEGORY_ITEMS,
) {
  ResourceBreadcrumbsService.register('OpenStack.SecurityGroup', resource => {
    return [
      {
        label: CATEGORY_ITEMS.private_clouds.label,
        state: CATEGORY_ITEMS.private_clouds.state,
        params: {
          uuid: resource.project_uuid,
        },
      },
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
