import { PythonManagementWithInstance } from '@waldur/ansible/jupyter-hub-management/types/PythonManagementWithInstance';

export interface JupyterHubManagementCreateState {
  loaded: boolean;
  erred: boolean;
  availablePythonManagements: PythonManagementWithInstance[];
}
