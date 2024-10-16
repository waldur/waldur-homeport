import { lazyComponent } from '@waldur/core/lazyComponent';
import { ActionRegistry } from '@waldur/resource/actions/registry';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import actions from './actions';
const OpenStackBackupSummary = lazyComponent(
  () => import('./OpenStackBackupSummary'),
  'OpenStackBackupSummary',
);

ResourceSummary.register('OpenStack.Backup', OpenStackBackupSummary);
ActionRegistry.register('OpenStack.Backup', actions);
