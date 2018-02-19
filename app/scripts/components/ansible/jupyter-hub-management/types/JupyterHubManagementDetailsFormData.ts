import { JupyterHubUsersHolder } from '@waldur/ansible/common/types/JupyterHubUsersHolder';
import { ManagementRequest } from '@waldur/ansible/common/types/ManagementRequest';
import { VirtualEnvAndRequestsContainer } from '@waldur/ansible/common/types/VirtualEnvAndRequestsContainer';
import { JupyterHubAuthenticationConfig } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubAuthenticationConfig';
import { JupyterHubManagementRequest } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementRequest';
import { JupyterHubManagementRequestStateTypePair } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementRequestStateTypePair';
import { JupyterHubManagementRequestType } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementRequestType';
import { PythonManagementDs } from '@waldur/ansible/jupyter-hub-management/types/PythonManagementDs';
import { PythonManagementRequest } from '@waldur/ansible/python-management/types/PythonManagementRequest';
import { VirtualEnvironment } from '@waldur/ansible/python-management/types/VirtualEnvironment';

export class JupyterHubManagementDetailsFormData
  extends VirtualEnvAndRequestsContainer<JupyterHubManagementRequest, JupyterHubManagementRequestStateTypePair>
  implements JupyterHubUsersHolder {

  authenticationConfig: JupyterHubAuthenticationConfig = new JupyterHubAuthenticationConfig();

  jupyterHubUrl: string;
  sessionTimeToLiveHours: number;
  requestsStateTypePairs: JupyterHubManagementRequestStateTypePair[] = [];
  requests: JupyterHubManagementRequest[] = [];

  selectedPythonManagement: PythonManagementDs;
  pythonManagementRequests: PythonManagementRequest[] = [];
  virtualEnvironments: VirtualEnvironment[] = [];

  getVirtualEnvironments = (formData: JupyterHubManagementDetailsFormData): VirtualEnvironment[] => {
    return formData.virtualEnvironments;
  }

  getAllRequests = (formData: JupyterHubManagementDetailsFormData): Array<ManagementRequest<any, any>> => {
    return [...formData.requests.filter(r => r.requestType !== JupyterHubManagementRequestType.SYNC_CONFIGURATION), ...formData.pythonManagementRequests];
  }
}
