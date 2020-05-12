import * as ResourceSummary from '@waldur/resource/summary/registry';

import './breadcrumbs';
import { OpenStackSnapshotScheduleSummary } from './OpenStackSnapshotScheduleSummary';
import './tabs';
import './actions';

// @ngInject
function stateConfig(ResourceStateConfigurationProvider) {
  ResourceStateConfigurationProvider.register(
    'OpenStackTenant.SnapshotSchedule',
    {
      error_states: ['error'],
    },
  );
}

export default module => {
  ResourceSummary.register(
    'OpenStackTenant.SnapshotSchedule',
    OpenStackSnapshotScheduleSummary,
  );
  module.config(stateConfig);
};
