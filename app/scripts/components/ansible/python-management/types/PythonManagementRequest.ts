import { ManagementRequest } from '@waldur/ansible/common/types/ManagementRequest';
import { Library } from '@waldur/ansible/python-management/types/Library';
import { PythonManagementRequestStateTypePair } from '@waldur/ansible/python-management/types/PythonManagementRequestStateTypePair';
import { PythonManagementRequestType } from '@waldur/ansible/python-management/types/PythonManagementRequestType';

export class PythonManagementRequest extends ManagementRequest<PythonManagementRequest, PythonManagementRequestStateTypePair> {
  requestType: PythonManagementRequestType;
  librariesToInstall: Library[];
  librariesToRemove: Library[];

  toStateTypePair(request: PythonManagementRequest): PythonManagementRequestStateTypePair {
    return new PythonManagementRequestStateTypePair(request.requestState, request.requestType);
  }
}
