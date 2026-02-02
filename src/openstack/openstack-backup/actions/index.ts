import {
  openstackBackupsSetErred,
  openstackBackupsSetOk,
} from 'waldur-js-client';

import { createSetErredAction } from '@waldur/resource/actions/SetResourceErredAction';
import { createSetOkAction } from '@waldur/resource/actions/SetResourceOkAction';
import { ActionConfiguration } from '@waldur/resource/actions/types';

import { DestroyBackupAction } from './DestroyBackupAction';
import { EditAction } from './EditAction';
import { RestoreAction } from './RestoreAction';

export const OpenStackBackupActions: ActionConfiguration = {
  type: 'OpenStack.Backup',
  actions: [
    EditAction,
    RestoreAction,
    DestroyBackupAction,
    createSetErredAction(openstackBackupsSetErred),
    createSetOkAction(openstackBackupsSetOk),
  ],
};
