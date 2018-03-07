import { PythonManagementRequestState } from '@waldur/python-management/types/PythonManagementRequestState';
import { PythonManagementRequestType } from '@waldur/python-management/types/PythonManagementRequestType';

export class PythonManagementRequestStateTypePair {
  constructor(public requestState: PythonManagementRequestState, public requestType: PythonManagementRequestType) {};
}
