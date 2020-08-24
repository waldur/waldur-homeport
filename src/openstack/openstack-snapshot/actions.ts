import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import { createPullAction } from '@waldur/resource/actions/base';

import destroyAction from './DestroyAction';
import editAction from './EditAction';
import restoreAction from './RestoreSnapshotAction';

ActionConfigurationRegistry.register('OpenStackTenant.Snapshot', [
  editAction,
  createPullAction,
  restoreAction,
  destroyAction,
]);
