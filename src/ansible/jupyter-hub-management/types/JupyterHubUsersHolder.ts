import { JupyterHubAuthenticationConfig } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubAuthenticationConfig';
import { JupyterHubManagementRequest } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementRequest';
import { ManagementRequestsHolder } from '@waldur/ansible/python-management/types/ManagementRequestsHolder';

export interface JupyterHubUsersHolder extends ManagementRequestsHolder<JupyterHubManagementRequest> {
  uuid: string;
  authenticationConfig: JupyterHubAuthenticationConfig;
}
