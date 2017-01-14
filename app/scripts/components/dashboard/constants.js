// Each chart should have equal number of data points
// Each sparkline chart bar has width equal to 4% so 25 by 4 points
export const POINTS_COUNT = 25;

export const DASHBOARD_QUOTAS = {
  nc_app_count: {
    title: 'Applications',
    feature: 'apps'
  },
  nc_vm_count: {
    title: 'Virtual machines',
    feature: 'vms'
  },
  nc_private_cloud_count: {
    title: 'Private clouds',
    feature: 'private_clouds',
  },
  nc_storage_count: {
    title: 'Storage',
    feature: 'storage'
  },
  nc_user_count: {
    title: 'Team size',
    feature: 'users'
  }
};

export const PROJECT_DASHBOARD_QUOTAS = [
  'nc_app_count',
  'nc_vm_count',
  'nc_private_cloud_count',
  'nc_storage_count'
];

export const ORGANIZATION_DASHBOARD_QUOTAS = [
  'nc_app_count',
  'nc_vm_count',
  'nc_private_cloud_count',
  'nc_storage_count',
  'nc_user_count'
];
