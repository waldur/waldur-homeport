import { lazyComponent } from '@waldur/core/lazyComponent';
import { ActionRegistry } from '@waldur/resource/actions/registry';
import { ResourceStateConfigurationProvider } from '@waldur/resource/state/ResourceStateConfiguration';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import actions from './actions';
const OpenStackBackupScheduleSummary = lazyComponent(
  () => import('./OpenStackBackupScheduleSummary'),
  'OpenStackBackupScheduleSummary',
);

ActionRegistry.register('OpenStackTenant.BackupSchedule', actions);
ResourceSummary.register(
  'OpenStackTenant.BackupSchedule',
  OpenStackBackupScheduleSummary,
);
ResourceStateConfigurationProvider.register('OpenStackTenant.BackupSchedule', {
  error_states: ['error'],
});
