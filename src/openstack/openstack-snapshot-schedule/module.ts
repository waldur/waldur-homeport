import { lazyComponent } from '@waldur/core/lazyComponent';
import { ActionRegistry } from '@waldur/resource/actions/registry';
import { ResourceStateConfigurationProvider } from '@waldur/resource/state/ResourceStateConfiguration';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import actions from './actions';
import './tabs';
const OpenStackSnapshotScheduleSummary = lazyComponent(
  () => import('./OpenStackSnapshotScheduleSummary'),
  'OpenStackSnapshotScheduleSummary',
);

ActionRegistry.register('OpenStackTenant.SnapshotSchedule', actions);
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
