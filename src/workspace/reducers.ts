import {
  SET_CURRENT_CUSTOMER,
  SET_CURRENT_PROJECT,
  SET_CURRENT_WORKSPACE,
  SET_CURRENT_USER,
  SET_CURRENT_RESOURCE,
} from './constants';
import { WorkspaceState } from './types';

const INITIAL_STATE: WorkspaceState = {
  user: undefined,
  customer: undefined,
  project: undefined,
  workspace: undefined,
  resource: undefined,
};

export const reducer = (state = INITIAL_STATE, action): WorkspaceState => {
  switch (action.type) {
    case SET_CURRENT_CUSTOMER:
      return {
        ...state,
        customer: action.payload.customer,
      };

    case SET_CURRENT_PROJECT:
      return {
        ...state,
        project: action.payload.project,
      };

    case SET_CURRENT_WORKSPACE:
      return {
        ...state,
        workspace: action.payload.workspace,
      };

    case SET_CURRENT_USER:
      return {
        ...state,
        user: action.payload.user,
      };

    case SET_CURRENT_RESOURCE:
      return {
        ...state,
        resource: action.payload.resource,
      };

    default:
      return state;
  }
};
