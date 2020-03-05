import {
  USER_LOGGED_IN,
  USER_UPDATED,
  USER_LOGGED_OUT,
  SET_CURRENT_CUSTOMER,
  SET_CURRENT_PROJECT,
  SET_CURRENT_WORKSPACE,
} from './constants';
import { Workspace } from './types';

const INITIAL_STATE: Workspace = {
  user: undefined,
  customer: undefined,
  project: undefined,
  workspace: undefined,
};

export const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case USER_LOGGED_IN:
    case USER_UPDATED:
      return {
        ...state,
        user: action.payload.user,
      };

    case USER_LOGGED_OUT:
      return {
        ...state,
        user: undefined,
      };

    case SET_CURRENT_CUSTOMER:
      return {
        ...state,
        customer: action.payload.customer,
        project: undefined,
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

    default:
      return state;
  }
};
