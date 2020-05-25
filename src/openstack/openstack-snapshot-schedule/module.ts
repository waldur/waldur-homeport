import { ResourceStateConfigurationProvider } from '@waldur/resource/state/ResourceStateConfiguration';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import './breadcrumbs';
import { OpenStackSnapshotScheduleSummary } from './OpenStackSnapshotScheduleSummary';
import './tabs';
import './actions';

export default () => {
  ResourceSummary.register(
    'OpenStackTenant.SnapshotSchedule',
    OpenStackSnapshotScheduleSummary,
  );
  ResourceStateConfigurationProvider.register(
    'OpenStackTenant.SnapshotSchedule',
    {
      error_states: ['error'],
    },
  );
};
