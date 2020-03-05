import {
  USER_LOGGED_IN,
  USER_UPDATED,
  USER_LOGGED_OUT,
  SET_CURRENT_CUSTOMER,
  SET_CURRENT_PROJECT,
  SET_CURRENT_WORKSPACE,
} from './constants';
import { WorkspaceType, Project } from './types';

export const userLoggedIn = user => ({
  type: USER_LOGGED_IN,
  payload: { user },
});

export const userUpdated = user => ({
  type: USER_UPDATED,
  payload: { user },
});

export const userLoggedOut = () => ({
  type: USER_LOGGED_OUT,
});

export const setCurrentCustomer = customer => ({
  type: SET_CURRENT_CUSTOMER,
  payload: {
    customer,
  },
});

export const setCurrentProject = (project: Project) => ({
  type: SET_CURRENT_PROJECT,
  payload: {
    project,
  },
});

export const setCurrentWorkspace = (workspace: WorkspaceType) => ({
  type: SET_CURRENT_WORKSPACE,
  payload: {
    workspace,
  },
});
