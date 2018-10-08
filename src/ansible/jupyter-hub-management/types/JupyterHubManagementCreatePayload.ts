import { PythonManagementWithInstance } from '@waldur/ansible/jupyter-hub-management/types/PythonManagementWithInstance';

export interface JupyterHubManagementCreatePayload {
  availablePythonManagements: PythonManagementWithInstance[];
}
