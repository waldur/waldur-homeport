import { JupyterHubUsersHolder } from '@waldur/ansible/common/types/JupyterHubUsersHolder';
import { ManagementRequest } from '@waldur/ansible/common/types/ManagementRequest';
import { VirtualEnvAndRequestsContainer } from '@waldur/ansible/common/types/VirtualEnvAndRequestsContainer';
import { JupyterHubAuthenticationConfig } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubAuthenticationConfig';
import { JupyterHubManagementRequest } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementRequest';
import { JupyterHubManagementRequestStateTypePair } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementRequestStateTypePair';
import { PythonManagementWithInstance } from '@waldur/ansible/jupyter-hub-management/types/PythonManagementWithInstance';
import { VirtualEnvironment } from '@waldur/ansible/python-management/types/VirtualEnvironment';

export class JupyterHubManagementFormData
  extends VirtualEnvAndRequestsContainer<JupyterHubManagementRequest, JupyterHubManagementRequestStateTypePair> implements JupyterHubUsersHolder {
  sessionTimeToLiveHours: number = 24;
  waldurPublicKeyInstalled: boolean;

  authenticationConfig: JupyterHubAuthenticationConfig = new JupyterHubAuthenticationConfig();
  selectedPythonManagement: PythonManagementWithInstance;

  requests: JupyterHubManagementRequest[] = [];

  getVirtualEnvironments = (formData: JupyterHubManagementFormData): VirtualEnvironment[] => {
    return formData.selectedPythonManagement.virtualEnvironments;
  }

  getAllRequests = (formData: JupyterHubManagementFormData): Array<ManagementRequest<any, any>> => {
    return formData.requests;
  }
}
