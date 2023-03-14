import {
  SET_CURRENT_CUSTOMER,
  SET_CURRENT_PROJECT,
  SET_CURRENT_WORKSPACE,
  SET_CURRENT_USER,
  SET_CURRENT_RESOURCE,
} from './constants';
import { WorkspaceType, Project } from './types';

export const setCurrentCustomer = (customer) => ({
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

export const setCurrentUser = (user) => ({
  type: SET_CURRENT_USER,
  payload: {
    user,
  },
});

export const setCurrentResource = (resource) => ({
  type: SET_CURRENT_RESOURCE,
  payload: {
    resource,
  },
});
