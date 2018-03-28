import { JupyterHubUsersHolder } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubUsersHolder';
import { existsExecutingGlobalRequest } from '@waldur/ansible/python-management/form/VirtualEnvironmentUtils';

export const areJupyterConfigFieldsDisabled = (jupyterHubManagement: JupyterHubUsersHolder, timeout: number): boolean => {
  return jupyterHubManagement.uuid && existsExecutingGlobalRequest(jupyterHubManagement, timeout);
};
