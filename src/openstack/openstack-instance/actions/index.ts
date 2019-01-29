import { createPullAction } from '@waldur/resource/actions/base';

import changeFlavorAction from './ChangeFlavorAction';
import consoleAction from './ConsoleAction';
import consoleLogAction from './ConsoleLogAction';
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
  startAction,
  stopAction,
  restartAction,
  consoleLogAction,
  consoleAction,
  changeFlavorAction,
  createBackupAction,
  createBackupScheduleAction,
  updateSecurityGroupsAction,
  updateInternalIpsSet,
  updateFloatingIpsAction,
  destroyAction,
];
