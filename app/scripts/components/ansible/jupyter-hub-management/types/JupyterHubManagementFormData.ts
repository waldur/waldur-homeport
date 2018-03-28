import { JupyterHubAuthenticationConfig } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubAuthenticationConfig';
import { JupyterHubManagementRequest } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementRequest';
import { JupyterHubUsersHolder } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubUsersHolder';
import { PythonManagementWithInstance } from '@waldur/ansible/jupyter-hub-management/types/PythonManagementWithInstance';
import { ManagementRequest } from '@waldur/ansible/python-management/types/ManagementRequest';
import { VirtualEnvAndRequestsContainer } from '@waldur/ansible/python-management/types/VirtualEnvAndRequestsContainer';
import { VirtualEnvironment } from '@waldur/ansible/python-management/types/VirtualEnvironment';

export class JupyterHubManagementFormData
  extends VirtualEnvAndRequestsContainer<JupyterHubManagementRequest> implements JupyterHubUsersHolder {
  sessionTimeToLiveHours: number = 24;
  waldurPublicKeyInstalled: boolean;

  authenticationConfig: JupyterHubAuthenticationConfig = new JupyterHubAuthenticationConfig();
  selectedPythonManagement: PythonManagementWithInstance;

  requests: JupyterHubManagementRequest[] = [];

  getVirtualEnvironments = (formData: JupyterHubManagementFormData): VirtualEnvironment[] => {
    return formData.selectedPythonManagement.virtualEnvironments;
  }

  getAllRequests = (formData: JupyterHubManagementFormData): Array<ManagementRequest<any>> => {
    return formData.requests;
  }
}
