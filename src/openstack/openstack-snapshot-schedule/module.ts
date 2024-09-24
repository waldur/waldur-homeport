import { lazyComponent } from '@waldur/core/lazyComponent';
import { ActionRegistry } from '@waldur/resource/actions/registry';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import actions from './actions';
const OpenStackSnapshotScheduleSummary = lazyComponent(
  () => import('./OpenStackSnapshotScheduleSummary'),
  'OpenStackSnapshotScheduleSummary',
);

ActionRegistry.register('OpenStack.SnapshotSchedule', actions);
ResourceSummary.register(
  'OpenStack.SnapshotSchedule',
  OpenStackSnapshotScheduleSummary,
);
