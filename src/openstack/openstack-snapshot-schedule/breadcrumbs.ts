import { getUUID } from '@waldur/core/utils';
import { gettext } from '@waldur/i18n';
import { ResourceBreadcrumbsRegistry } from '@waldur/resource/breadcrumbs/ResourceBreadcrumbsRegistry';

import { getInstanceListState } from '../utils';

ResourceBreadcrumbsRegistry.register(
  'OpenStackTenant.SnapshotSchedule',
  resource => {
    const volume_uuid = getUUID(resource.source_volume);
    return [
      getInstanceListState(resource.project_uuid),
      {
        label: resource.source_volume_name,
        state: 'resources.details',
        params: {
          uuid: volume_uuid,
          resource_type: 'OpenStackTenant.Volume',
        },
      },
      {
        label: gettext('Snapshot schedules'),
        state: 'resources.details',
        params: {
          uuid: volume_uuid,
          resource_type: 'OpenStackTenant.Volume',
          tab: 'snapshot_schedules',
        },
      },
    ];
  },
);
