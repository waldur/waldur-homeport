// Each chart should have equal number of data points
// Each sparkline chart bar has width equal to 4% so 25 by 4 points
export const POINTS_COUNT = 25;

export const DASHBOARD_QUOTAS = {
  nc_project_count: {
    title: gettext('Projects'),
  },
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
    title: gettext('Block device count'),
    feature: 'storage'
  },
  nc_volume_count: {
    title: gettext('Block volume count'),
    feature: 'storage'
  },
  nc_snapshot_count: {
    title: gettext('Block snapshot count'),
    feature: 'storage'
  },
  nc_user_count: {
    title: gettext('Team size'),
    feature: 'users'
  },
  nc_cpu_usage: {
    title: gettext('Batch CPU usage, hours'),
    feature: 'slurm',
    formatter: x => Math.round(x / 60)
  },
  nc_gpu_usage: {
    title: gettext('Batch GPU usage, hours'),
    feature: 'slurm',
    formatter: x => Math.round(x / 60)
  },
  nc_ram_usage: {
    title: gettext('Batch RAM usage, GB'),
    feature: 'slurm',
    formatter: x => Math.round(x / 1024)
  },
};

export const PROJECT_DASHBOARD_QUOTAS = [
  'nc_app_count',
  'nc_vm_count',
  'nc_private_cloud_count',
  'nc_storage_count',
  'nc_volume_count',
  'nc_snapshot_count',
  'nc_cpu_usage',
  'nc_gpu_usage',
  'nc_ram_usage',
];

export const ORGANIZATION_DASHBOARD_QUOTAS = [
  'nc_project_count',
  'nc_app_count',
  'nc_vm_count',
  'nc_private_cloud_count',
  'nc_storage_count',
  'nc_user_count',
  'nc_cpu_usage',
  'nc_gpu_usage',
  'nc_ram_usage',
];
