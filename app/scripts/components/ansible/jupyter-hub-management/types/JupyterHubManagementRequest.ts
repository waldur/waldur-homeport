import { JupyterHubManagementRequestType } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementRequestType';
import { JUPYTER_REQUEST_TYPE_READABLE_TEXT_MAPPING } from '@waldur/ansible/python-management/state-builder/RequestStateReadableTextMappings';
import { ManagementRequest } from '@waldur/ansible/python-management/types/ManagementRequest';

export class JupyterHubManagementRequest extends ManagementRequest<JupyterHubManagementRequest> {
  requestType: JupyterHubManagementRequestType;

  buildRequestTypeTooltip(request: JupyterHubManagementRequest): string {
    return JUPYTER_REQUEST_TYPE_READABLE_TEXT_MAPPING[request.requestType];
  }
}
