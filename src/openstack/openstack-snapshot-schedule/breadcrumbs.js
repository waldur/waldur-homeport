// @ngInject
export default function breadcrumbsConfig(ResourceBreadcrumbsService, ncUtils, CATEGORY_ITEMS) {
  ResourceBreadcrumbsService.register('OpenStackTenant.SnapshotSchedule', resource => {
    const volume_uuid = ncUtils.getUUID(resource.source_volume);
    return [
      {
        label: CATEGORY_ITEMS.vms.label,
        state: CATEGORY_ITEMS.vms.state,
        params: {
          uuid: resource.project_uuid
        }
      },
      {
        label: resource.source_volume_name,
        state: 'resources.details',
        params: {
          uuid: volume_uuid,
          resource_type: 'OpenStackTenant.Volume'
        }
      },
      {
        label: gettext('Snapshot schedules'),
        state: 'resources.details',
        params: {
          uuid: volume_uuid,
          resource_type: 'OpenStackTenant.Volume',
          tab: 'snapshot_schedules'
        }
      },
    ];
  });
}
