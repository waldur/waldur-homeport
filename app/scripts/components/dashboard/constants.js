// Each chart should have equal number of data points
// Each sparkline chart bar has width equal to 4% so 25 by 4 points
export const POINTS_COUNT = 25;

export const DASHBOARD_QUOTAS = {
  nc_app_count: {
    title: gettext('Applications'),
    feature: 'apps'
  },
  nc_vm_count: {
    title: gettext('Virtual machines'),
    feature: 'vms'
  },
  nc_private_cloud_count: {
    title: gettext('Private clouds'),
    feature: 'private_clouds',
  },
  nc_storage_count: {
    title: gettext('Storage'),
    feature: 'storage'
  },
  nc_user_count: {
    title: gettext('Team size'),
    feature: 'users'
  }
};

export const PROJECT_DASHBOARD_QUOTAS = [
  'nc_app_count',
  'nc_vm_count',
  'nc_private_cloud_count',
  'nc_storage_count',
  'volumes',
  'snapshots'
];

export const ORGANIZATION_DASHBOARD_QUOTAS = [
  'nc_app_count',
  'nc_vm_count',
  'nc_private_cloud_count',
  'nc_storage_count',
  'snapshots',
  'volumes',
  'nc_user_count'
];
