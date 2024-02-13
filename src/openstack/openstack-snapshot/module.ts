import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ResourceSummary from '@waldur/resource/summary/registry';

const OpenStackSnapshotSummary = lazyComponent(
  () => import('./OpenStackSnapshotSummary'),
  'OpenStackSnapshotSummary',
);
import './actions';

ResourceSummary.register('OpenStackTenant.Snapshot', OpenStackSnapshotSummary);
