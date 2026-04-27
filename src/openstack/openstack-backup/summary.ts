import { lazyComponent } from '@/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@/resource/summary/types';

const OpenStackBackupSummary = lazyComponent(() =>
  import('./OpenStackBackupSummary').then((module) => ({
    default: module.OpenStackBackupSummary,
  })),
);

export const OpenStackBackupSummaryConfiguration: ResourceSummaryConfiguration =
  {
    type: 'OpenStack.Backup',
    component: OpenStackBackupSummary,
  };
