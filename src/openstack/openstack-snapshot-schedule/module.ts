import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import { ResourceStateConfigurationProvider } from '@waldur/resource/state/ResourceStateConfiguration';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import actions from './actions';
import './breadcrumbs';
import { OpenStackSnapshotScheduleSummary } from './OpenStackSnapshotScheduleSummary';
import './tabs';

export default () => {
  ActionConfigurationRegistry.register(
    'OpenStackTenant.SnapshotSchedule',
    actions,
  );
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
