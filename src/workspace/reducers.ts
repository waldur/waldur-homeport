import {
  SET_CURRENT_CUSTOMER,
  SET_CURRENT_PROJECT,
  SET_CURRENT_WORKSPACE,
  SET_CURRENT_USER,
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

    case SET_CURRENT_USER:
      return {
        ...state,
        user: action.payload.user,
      };

    default:
      return state;
  }
};
