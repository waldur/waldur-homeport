import { combineReducers } from 'redux';

import {
  JUPYTER_HUB_MANAGEMENT_ERRED,
  JUPYTER_HUB_MANAGEMENT_LOADED,
  SAVE_AVAILABLE_PYTHON_MANAGEMENTS
} from '@waldur/ansible/jupyter-hub-management/actionNames';
import { JupyterHubManagementCreatePayload } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementCreatePayload';
import { JupyterHubManagementCreateState } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementCreateState';
import { JupyterHubManagementDetailsState } from '@waldur/ansible/jupyter-hub-management/types/JupyterManagementDetailsState';
import { Action } from '@waldur/core/reducerActions';

const DETAILS_INITIAL_STATE: JupyterHubManagementDetailsState = {
  loaded: false,
  erred: false,
};

const jupyterHubManagementDetailsReducer =
  (state: JupyterHubManagementDetailsState = DETAILS_INITIAL_STATE, action: Action<any>): JupyterHubManagementDetailsState => {
    const {type} = action;
    switch (type) {
      case JUPYTER_HUB_MANAGEMENT_LOADED:
        return {
          ...state,
          loaded: true,
          erred: false,
        };
      case JUPYTER_HUB_MANAGEMENT_ERRED:
        return {
          ...state,
          loaded: false,
          erred: true,
        };
      default:
        return state;
    }
  };

const CREATE_INITIAL_STATE: JupyterHubManagementCreateState = {
  loaded: false,
  erred: false,
  availablePythonManagements: [],
};

const jupyterHubManagementCreateReducer =
  (state: JupyterHubManagementCreateState = CREATE_INITIAL_STATE, action: Action<JupyterHubManagementCreatePayload>): JupyterHubManagementCreateState => {
    const {type, payload} = action;
    switch (type) {
      case JUPYTER_HUB_MANAGEMENT_LOADED:
        return {
          ...state,
          loaded: true,
          erred: false,
        };
      case JUPYTER_HUB_MANAGEMENT_ERRED:
        return {
          ...state,
          loaded: false,
          erred: true,
        };
      case SAVE_AVAILABLE_PYTHON_MANAGEMENTS:
        return {
          ...state,
          availablePythonManagements: payload.availablePythonManagements,
        };
      default:
        return state;
    }
  };

export const reducer = combineReducers({
  details: jupyterHubManagementDetailsReducer,
  create: jupyterHubManagementCreateReducer,
});
