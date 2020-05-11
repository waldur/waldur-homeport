import { getUUID } from '@waldur/core/utils';
import { gettext } from '@waldur/i18n';
import { ResourceBreadcrumbsRegistry } from '@waldur/resource/breadcrumbs/ResourceBreadcrumbsRegistry';

import { getInstanceListState } from '../utils';

ResourceBreadcrumbsRegistry.register(
  'OpenStackTenant.BackupSchedule',
  resource => {
    const instance_uuid = getUUID(resource.instance);
    return [
      getInstanceListState(resource.project_uuid),
      {
        label: resource.instance_name,
        state: 'resources.details',
        params: {
          uuid: instance_uuid,
          resource_type: 'OpenStackTenant.Instance',
        },
      },
      {
        label: gettext('Backup schedules'),
        state: 'resources.details',
        params: {
          uuid: instance_uuid,
          resource_type: 'OpenStackTenant.Instance',
          tab: 'backup_schedules',
        },
      },
    ];
  },
);
