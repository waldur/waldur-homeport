import { gettext } from '@waldur/i18n';

import { PROJECT_DASHBOARD, CUSTOMER_DASHBOARD } from './constants';
import { registerQuotas } from './registry';

registerQuotas([
  {
    quota: 'nc_app_count',
    title: gettext('Applications'),
    feature: 'apps',
    dashboards: [PROJECT_DASHBOARD, CUSTOMER_DASHBOARD],
  },
  {
    quota: 'nc_vm_count',
    title: gettext('Virtual machines'),
    feature: 'vms',
    dashboards: [PROJECT_DASHBOARD, CUSTOMER_DASHBOARD],
  },
  {
    quota: 'nc_private_cloud_count',
    title: gettext('Private clouds'),
    feature: 'private_clouds',
    dashboards: [PROJECT_DASHBOARD, CUSTOMER_DASHBOARD],
  },
  {
    quota: 'nc_storage_count',
    title: gettext('Block device count'),
    feature: 'storage',
    dashboards: [PROJECT_DASHBOARD, CUSTOMER_DASHBOARD],
  },
  {
    quota: 'nc_project_count',
    title: gettext('Projects'),
    dashboards: [CUSTOMER_DASHBOARD],
  },
  {
    quota: 'nc_user_count',
    title: gettext('Team size'),
    feature: 'users',
    dashboards: [CUSTOMER_DASHBOARD],
  },
  {
    quota: 'nc_volume_count',
    title: gettext('Block volume count'),
    feature: 'storage',
    dashboards: [PROJECT_DASHBOARD],
  },
  {
    quota: 'nc_volume_size',
    title: gettext('Volume size, GB'),
    feature: 'storage',
    formatter: x => Math.round(x / 1024),
    dashboards: [PROJECT_DASHBOARD, CUSTOMER_DASHBOARD],
  },
  {
    quota: 'nc_snapshot_count',
    title: gettext('Block snapshot count'),
    feature: 'storage',
    dashboards: [PROJECT_DASHBOARD],
  },
  {
    quota: 'nc_snapshot_size',
    title: gettext('Snapshot size, GB'),
    feature: 'storage',
    formatter: x => Math.round(x / 1024),
    dashboards: [PROJECT_DASHBOARD, CUSTOMER_DASHBOARD],
  },
]);
