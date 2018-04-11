import { createPullAction } from '@waldur/resource/actions/base';

import changeFlavorAction from './ChangeFlavorAction';
import createBackupAction from './CreateBackupAction';
import createBackupScheduleAction from './CreateBackupScheduleAction';
import destroyAction from './DestroyAction';
import editAction from './EditAction';
import restartAction from './RestartAction';
import startAction from './StartAction';
import stopAction from './StopAction';
import updateFloatingIpsAction from './UpdateFloatingIpsAction';
import updateInternalIpsSet from './UpdateInternalIpsSet';
import updateSecurityGroupsAction from './UpdateSecurityGroupsAction';

export default [
  editAction,
  createPullAction,
  changeFlavorAction,
  startAction,
  stopAction,
  restartAction,
  updateSecurityGroupsAction,
  createBackupScheduleAction,
  updateInternalIpsSet,
  updateFloatingIpsAction,
  destroyAction,
  createBackupAction,
];
