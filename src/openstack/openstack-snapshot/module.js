import * as ResourceSummary from '@waldur/resource/summary/registry';

import { OpenStackSnapshotSummary } from './OpenStackSnapshotSummary';
import './actions';
import './tabs';

// @ngInject
function stateConfig(ResourceStateConfigurationProvider) {
  ResourceStateConfigurationProvider.register('OpenStackTenant.Snapshot', {
    error_states: ['error'],
  });
}

export default module => {
  ResourceSummary.register(
    'OpenStackTenant.Snapshot',
    OpenStackSnapshotSummary,
  );
  module.config(stateConfig);
};
