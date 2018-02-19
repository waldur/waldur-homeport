import { ManagementRequest } from '@waldur/ansible/common/types/ManagementRequest';
import { JupyterHubManagementRequestStateTypePair } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementRequestStateTypePair';
import { JupyterHubManagementRequestType } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementRequestType';

export class JupyterHubManagementRequest extends ManagementRequest<JupyterHubManagementRequest, JupyterHubManagementRequestStateTypePair> {
  requestType: JupyterHubManagementRequestType;

  toStateTypePair(request: JupyterHubManagementRequest): JupyterHubManagementRequestStateTypePair {
    return new JupyterHubManagementRequestStateTypePair(request.requestState, request.requestType);
  }
}
