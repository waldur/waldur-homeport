import { lazyComponent } from '@waldur/core/lazyComponent';
import { ActionRegistry } from '@waldur/resource/actions/registry';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import actions from './actions';
const OpenStackBackupScheduleSummary = lazyComponent(
  () => import('./OpenStackBackupScheduleSummary'),
  'OpenStackBackupScheduleSummary',
);

ActionRegistry.register('OpenStack.BackupSchedule', actions);
ResourceSummary.register(
  'OpenStack.BackupSchedule',
  OpenStackBackupScheduleSummary,
);
