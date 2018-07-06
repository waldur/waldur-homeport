import { CUSTOMER_DASHBOARD, PROJECT_DASHBOARD } from '@waldur/dashboard/constants';
import { registerQuotas } from '@waldur/dashboard/registry';
import { gettext } from '@waldur/i18n';

registerQuotas([
  {
    quota: 'nc_cpu_usage',
    title: gettext('Batch CPU usage'),
    feature: 'slurm',
    type: 'hours',
    dashboards: [PROJECT_DASHBOARD, CUSTOMER_DASHBOARD],
  },
  {
    quota: 'nc_gpu_usage',
    title: gettext('Batch GPU usage'),
    feature: 'slurm',
    type: 'hours',
    dashboards: [PROJECT_DASHBOARD, CUSTOMER_DASHBOARD],
  },
  {
    quota: 'nc_ram_usage',
    title: gettext('Batch RAM usage'),
    feature: 'slurm',
    type: 'filesize',
    dashboards: [PROJECT_DASHBOARD, CUSTOMER_DASHBOARD],
  },
]);
