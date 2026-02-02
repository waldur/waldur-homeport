import {
  openstackSnapshotsSetErred,
  openstackSnapshotsSetOk,
} from 'waldur-js-client';

import { createSetErredAction } from '@waldur/resource/actions/SetResourceErredAction';
import { createSetOkAction } from '@waldur/resource/actions/SetResourceOkAction';
import { ActionConfiguration } from '@waldur/resource/actions/types';

import { DestroySnapshotAction } from './DestroySnapshotAction';
import { EditAction } from './EditAction';
import { PullSnapshotAction } from './PullSnapshotAction';
import { RestoreSnapshotAction } from './RestoreSnapshotAction';

export const OpenStackSnapshotActions: ActionConfiguration = {
  type: 'OpenStack.Snapshot',
  actions: [
    EditAction,
    PullSnapshotAction,
    RestoreSnapshotAction,
    DestroySnapshotAction,
    createSetErredAction(openstackSnapshotsSetErred),
    createSetOkAction(openstackSnapshotsSetOk),
  ],
};
