import {PythonManagementRequestState} from '@waldur/ansible/python-management/types/PythonManagementRequestState';
import {PythonManagementRequestType} from '@waldur/ansible/python-management/types/PythonManagementRequestType';

export class PythonManagementRequestStateTypePair {

  constructor(public requestState: PythonManagementRequestState, public requestType: PythonManagementRequestType) {
  }
}
