// @ngInject
export default function breadcrumbsConfig(ResourceBreadcrumbsService, ncUtils, CATEGORY_ITEMS) {
  ResourceBreadcrumbsService.register('OpenStackTenant.Backup', resource => {
    const instance_uuid = ncUtils.getUUID(resource.instance);
    return [
      {
        label: CATEGORY_ITEMS.vms.label,
        state: CATEGORY_ITEMS.vms.state,
        params: {
          uuid: resource.project_uuid
        }
      },
      {
        label: resource.instance_name,
        state: 'resources.details',
        params: {
          uuid: instance_uuid,
          resource_type: 'OpenStackTenant.Instance'
        }
      },
      {
        label: gettext('Backups'),
        state: 'resources.details',
        params: {
          uuid: instance_uuid,
          resource_type: 'OpenStackTenant.Instance',
          tab: 'backups'
        }
      },
    ];
  });
}
