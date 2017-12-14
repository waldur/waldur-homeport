import { CUSTOMER_DASHBOARD, PROJECT_DASHBOARD } from '@waldur/dashboard/constants';
import { registerQuotas } from '@waldur/dashboard/registry';
import { gettext } from '@waldur/i18n';

registerQuotas([
  {
    quota: 'nc_cpu_usage',
    title: gettext('Batch CPU usage, hours'),
    feature: 'slurm',
    formatter: x => Math.round(x / 60),
    dashboards: [PROJECT_DASHBOARD, CUSTOMER_DASHBOARD],
  },
  {
    quota: 'nc_gpu_usage',
    title: gettext('Batch GPU usage, hours'),
    feature: 'slurm',
    formatter: x => Math.round(x / 60),
    dashboards: [PROJECT_DASHBOARD, CUSTOMER_DASHBOARD],
  },
  {
    quota: 'nc_ram_usage',
    title: gettext('Batch RAM usage, GB'),
    feature: 'slurm',
    formatter: x => Math.round(x / 1024),
    dashboards: [PROJECT_DASHBOARD, CUSTOMER_DASHBOARD],
  },
]);
