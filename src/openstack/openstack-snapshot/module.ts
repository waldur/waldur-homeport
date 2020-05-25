import { ResourceStateConfigurationProvider } from '@waldur/resource/state/ResourceStateConfiguration';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import { OpenStackSnapshotSummary } from './OpenStackSnapshotSummary';
import './actions';
import './tabs';

export default () => {
  ResourceSummary.register(
    'OpenStackTenant.Snapshot',
    OpenStackSnapshotSummary,
  );
  ResourceStateConfigurationProvider.register('OpenStackTenant.Snapshot', {
    error_states: ['error'],
  });
};
