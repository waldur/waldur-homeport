import { createFormAction } from 'redux-form-saga';

import {
  JUPYTER_HUB_MANAGEMENT_ERRED,
  JUPYTER_HUB_MANAGEMENT_LOADED,
  SAVE_AVAILABLE_PYTHON_MANAGEMENTS,
} from '@waldur/ansible/jupyter-hub-management/actionNames';
import { JupyterHubManagementCreatePayload } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementCreatePayload';
import { PythonManagementWithInstance } from '@waldur/ansible/jupyter-hub-management/types/PythonManagementWithInstance';
import { Action } from '@waldur/core/reducerActions';

export const createJupyterHubManagement = createFormAction('waldur/jupyterHubManagement/CREATE');
export const updateJupyterHubManagement = createFormAction('waldur/jupyterHubManagement/UPDATE');
export const deleteJupyterHubManagement = createFormAction('waldur/jupyterHubManagement/DELETE');
export const initializeJupyterHubManagementCreate = createFormAction('waldur/jupyterHubManagement/INITIALIZE_CREATE');
export const initializeJupyterHubManagementDetails = createFormAction('waldur/jupyterHubManagement/INITIALIZE_DETAILS');
export const triggerJupyterHubRequestOutputPollingTask = createFormAction('waldur/jupyterHubManagement/TRIGGER_JUPYTER_REQUEST_OUTPUT_POLLING_TASK');

export const jupyterHubManagementLoaded = (): Action<{}> => ({
  type: JUPYTER_HUB_MANAGEMENT_LOADED,
  payload: {},
});

export const jupyterHubManagementErred = (): Action<{}> => ({
  type: JUPYTER_HUB_MANAGEMENT_ERRED,
  payload: {},
});

export const saveAvailablePythonManagements = (availablePythonManagements: PythonManagementWithInstance[]): Action<JupyterHubManagementCreatePayload> => ({
  type: SAVE_AVAILABLE_PYTHON_MANAGEMENTS,
  payload: {
    availablePythonManagements,
  },
});
