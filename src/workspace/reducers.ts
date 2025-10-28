import {
  SET_CURRENT_CUSTOMER,
  SET_CURRENT_PROJECT,
  SET_CURRENT_RESOURCE,
  SET_CURRENT_USER,
  SET_IMPERSONATOR_USER,
} from './constants';
import { WorkspaceState } from './types';

const INITIAL_STATE: WorkspaceState = {
  user: undefined,
  impersonatorUser: undefined,
  customer: undefined,
  project: undefined,
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

    case SET_CURRENT_USER:
      return {
        ...state,
        user: action.payload.user,
      };

    case SET_IMPERSONATOR_USER:
      return {
        ...state,
        impersonatorUser: action.payload.user,
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
