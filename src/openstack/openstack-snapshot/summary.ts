import { lazyComponent } from '@/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@/resource/summary/types';

const OpenStackSnapshotSummary = lazyComponent(() =>
  import('./OpenStackSnapshotSummary').then((module) => ({
    default: module.OpenStackSnapshotSummary,
  })),
);

export const OpenStackSnapshotSummaryConfiguration: ResourceSummaryConfiguration =
  {
    type: 'OpenStack.Snapshot',
    component: OpenStackSnapshotSummary,
  };
