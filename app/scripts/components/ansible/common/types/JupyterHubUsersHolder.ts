import { ManagementRequestsHolder } from '@waldur/ansible/common/types/ManagementRequestsHolder';
import { JupyterHubAuthenticationConfig } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubAuthenticationConfig';
import { JupyterHubManagementRequest } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementRequest';
import { JupyterHubManagementRequestStateTypePair } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementRequestStateTypePair';

export interface JupyterHubUsersHolder extends ManagementRequestsHolder<JupyterHubManagementRequest, JupyterHubManagementRequestStateTypePair> {
  uuid: string;
  authenticationConfig: JupyterHubAuthenticationConfig;
}
