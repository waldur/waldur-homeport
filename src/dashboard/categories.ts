import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

import { Quota, Action } from './types';

export interface DashboardCategory {
  title: string;
  quotas: Quota[];
  actions: Action[];
}

const getCompute = () => ({
  title: translate('Compute'),
  quotas: [
    {
      quota: 'nc_vm_count',
      title: translate('Virtual machines'),
    },
    {
      quota: 'nc_private_cloud_count',
      title: translate('Private clouds'),
    },
  ],
  actions: [],
});

const getStorage = () => ({
  title: translate('Storage'),
  quotas: [
    {
      quota: 'nc_storage_count',
      title: translate('Block device count'),
    },
    {
      quota: 'nc_volume_count',
      title: translate('Block volume count'),
    },
    {
      quota: 'nc_volume_size',
      title: translate('Volume size'),
      type: 'filesize',
    },
    {
      quota: 'nc_snapshot_count',
      title: translate('Block snapshot count'),
    },
    {
      quota: 'nc_snapshot_size',
      title: translate('Snapshot size'),
      type: 'filesize',
    },
  ],
  actions: [],
});

const getBatch = () => ({
  title: translate('Batch processing'),
  quotas: [
    {
      quota: 'nc_cpu_usage',
      title: translate('CPU usage'),
      type: 'hours',
    },
    {
      quota: 'nc_gpu_usage',
      title: translate('GPU usage'),
      type: 'hours',
    },
    {
      quota: 'nc_ram_usage',
      title: translate('RAM usage'),
      type: 'filesize',
    },
  ],
  actions: [],
});

export const getDashboardCategories = (): DashboardCategory[] => {
  const categories = [getCompute()];
  const features = ngInjector.get('features');

  if (features.isVisible('storage')) {
    categories.push(getStorage());
  }

  if (features.isVisible('slurm')) {
    categories.push(getBatch());
  }

  return categories;
};
