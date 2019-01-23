import { ngInjector, $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { WorkspaceType } from '@waldur/workspace/types';

import { Quota, Action } from './types';

export interface DashboardCategory {
  title: string;
  quotas: Quota[];
  actions: Action[];
}

const createHandler = (workspace: WorkspaceType, state: string) => () => {
  if (workspace === 'project') {
    $state.go(state);
  } else {
    ngInjector.get('AppStoreUtilsService').openDialog({
      selectProject: true,
    });
  }
};

const getCompute = (workspace: WorkspaceType) => ({
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
  actions: [
    {
      title: translate('Add virtual machine'),
      onClick: createHandler(workspace, 'appstore.vms'),
    },
    {
      title: translate('Add virtual private cloud'),
      onClick: createHandler(workspace, 'appstore.private_clouds'),
    },
  ],
});

const getStorage = (workspace: WorkspaceType) => ({
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
  actions: [
    {
      title: translate('Add volume'),
      onClick: createHandler(workspace, 'appstore.storages'),
    },
  ],
});

const getBatch = (workspace: WorkspaceType) => ({
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
  actions: [
    {
      title: translate('Add SLURM allocation'),
      onClick: createHandler(workspace, 'appstore.slurm'),
    },
    {
      title: translate('Add MOAB allocation'),
      onClick: createHandler(workspace, 'appstore.slurm'),
    },
  ],
});

export const getDashboardCategories = (workspace: WorkspaceType): DashboardCategory[] => {
  const categories = [getCompute(workspace)];
  const features = ngInjector.get('features');

  if (features.isVisible('storage')) {
    categories.push(getStorage(workspace));
  }

  if (features.isVisible('slurm')) {
    categories.push(getBatch(workspace));
  }

  return categories;
};
