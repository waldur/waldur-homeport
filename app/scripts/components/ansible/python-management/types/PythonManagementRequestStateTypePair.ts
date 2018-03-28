import { PYTHON_REQUEST_TYPE_READABLE_TEXT_MAPPING } from '@waldur/ansible/python-management/state-builder/RequestStateReadableTextMappings';
import { ManagementRequestState } from '@waldur/ansible/python-management/types/ManagementRequestState';
import { ManagementRequestStateTypePair } from '@waldur/ansible/python-management/types/ManagementRequestStateTypePair';
import { PythonManagementRequestType } from '@waldur/ansible/python-management/types/PythonManagementRequestType';
import { translate } from '@waldur/i18n';

export class PythonManagementRequestStateTypePair implements ManagementRequestStateTypePair<PythonManagementRequestStateTypePair> {
  constructor(public requestState: ManagementRequestState, public requestType: PythonManagementRequestType) {
  }

  buildReadableTooltip(request: PythonManagementRequestStateTypePair): string {
    return translate(PYTHON_REQUEST_TYPE_READABLE_TEXT_MAPPING[request.requestType]);
  }
}
