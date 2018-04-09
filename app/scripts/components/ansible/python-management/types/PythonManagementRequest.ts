import {
  PYTHON_REQUEST_TYPE_READABLE_TEXT_MAPPING
} from '@waldur/ansible/python-management/state-builder/RequestStateReadableTextMappings';
import { Library } from '@waldur/ansible/python-management/types/Library';
import { ManagementRequest } from '@waldur/ansible/python-management/types/ManagementRequest';
import { PythonManagementRequestType } from '@waldur/ansible/python-management/types/PythonManagementRequestType';

export class PythonManagementRequest extends ManagementRequest<PythonManagementRequest> {
  requestType: PythonManagementRequestType;
  librariesToInstall: Library[];
  librariesToRemove: Library[];

  buildRequestTypeTooltip(request: PythonManagementRequest): string {
    return PYTHON_REQUEST_TYPE_READABLE_TEXT_MAPPING[request.requestType];
  }
}
