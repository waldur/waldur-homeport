import { ActionContext } from '@waldur/resource/actions/types';

import { createPullAction as pullAction } from './base';
import changeFlavorAction from './ChangeFlavorAction';
import createBackupScheduleAction from './CreateBackupScheduleAction';
import editAction from './EditAction';
import restartAction from './RestartAction';
import startAction from './StartAction';
import stopAction from './StopAction';
import updateInternalIpsSet from './UpdateInternalIpsSet';
import updateSecurityGroupsAction from './UpdateSecurityGroupsAction';

export const createActions = (ctx: ActionContext) => {
  return [
    editAction(ctx),
    pullAction(ctx),
    changeFlavorAction(ctx),
    startAction(ctx),
    stopAction(ctx),
    restartAction(ctx),
    updateSecurityGroupsAction(ctx),
    createBackupScheduleAction(ctx),
    updateInternalIpsSet(ctx),
  ];
};
