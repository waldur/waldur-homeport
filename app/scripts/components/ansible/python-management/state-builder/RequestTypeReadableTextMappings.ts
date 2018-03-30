import { ManagementRequestState } from '@waldur/ansible/python-management/types/ManagementRequestState';

type PythonManagementRequestStateReadabilityMap = {[key in ManagementRequestState]: string};

export const STATE_READABLE_TEXT_MAPPING: PythonManagementRequestStateReadabilityMap = {
  [ManagementRequestState.OK]: 'OK',
  [ManagementRequestState.ERRED]: 'Erred',
  [ManagementRequestState.CREATION_SCHEDULED]: 'Execution Scheduled',
  [ManagementRequestState.CREATING]: 'Executing',
};
