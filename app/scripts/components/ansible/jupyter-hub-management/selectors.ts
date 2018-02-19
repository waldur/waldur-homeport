import { PythonManagementWithInstance } from '@waldur/ansible/jupyter-hub-management/types/PythonManagementWithInstance';

export const getJupyterHubManagementDetailsLoaded = (state): boolean => state.jupyterHubManagement.details.loaded;
export const getJupyterHubManagementDetailsErred = (state): boolean => state.jupyterHubManagement.details.erred;
export const getJupyterHubManagementCreateLoaded = (state): boolean => state.jupyterHubManagement.create.loaded;
export const getJupyterHubManagementCreateErred = (state): boolean => state.jupyterHubManagement.create.erred;
export const getAvailablePythonManagements = (state): PythonManagementWithInstance[] => state.jupyterHubManagement.create.availablePythonManagements;
