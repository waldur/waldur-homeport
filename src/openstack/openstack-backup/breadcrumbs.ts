import { getUUID } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { ResourceBreadcrumbsRegistry } from '@waldur/resource/breadcrumbs/ResourceBreadcrumbsRegistry';

import { getInstanceListState } from '../utils';

ResourceBreadcrumbsRegistry.register('OpenStackTenant.Backup', (resource) => {
  const instance_uuid = getUUID(resource.instance);
  return [
    getInstanceListState(resource.project_uuid),
    {
      label: resource.instance_name,
      state: 'resource-details',
      params: {
        uuid: instance_uuid,
        resource_type: 'OpenStackTenant.Instance',
      },
    },
    {
      label: translate('VM snapshots'),
      state: 'resource-details',
      params: {
        uuid: instance_uuid,
        resource_type: 'OpenStackTenant.Instance',
        tab: 'backups',
      },
    },
  ];
});
