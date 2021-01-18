import { ActionRegistry } from '@waldur/resource/actions/registry';

import { DestroySnapshotAction } from './DestroySnapshotAction';
import { EditAction } from './EditAction';
import { PullSnapshotAction } from './PullSnapshotAction';
import { RestoreSnapshotAction } from './RestoreSnapshotAction';

ActionRegistry.register('OpenStackTenant.Snapshot', [
  EditAction,
  PullSnapshotAction,
  RestoreSnapshotAction,
  DestroySnapshotAction,
]);
