import { lazyComponent } from '@waldur/core/lazyComponent';
import { ResourceStateConfigurationProvider } from '@waldur/resource/state/ResourceStateConfiguration';
import * as ResourceSummary from '@waldur/resource/summary/registry';

const OpenStackSnapshotSummary = lazyComponent(
  () => import('./OpenStackSnapshotSummary'),
  'OpenStackSnapshotSummary',
);
import './actions';

ResourceSummary.register('OpenStackTenant.Snapshot', OpenStackSnapshotSummary);
ResourceStateConfigurationProvider.register('OpenStackTenant.Snapshot', {
  error_states: ['error'],
});
