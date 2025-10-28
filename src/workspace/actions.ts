import { Customer, Resource, User } from 'waldur-js-client';

import {
  SET_CURRENT_CUSTOMER,
  SET_CURRENT_PROJECT,
  SET_CURRENT_RESOURCE,
  SET_CURRENT_USER,
  SET_IMPERSONATOR_USER,
} from './constants';
import { Project } from './types';

export const setCurrentCustomer = (customer: Customer) => ({
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

export const setCurrentUser = (user: User) => ({
  type: SET_CURRENT_USER,
  payload: {
    user,
  },
});

export const setImpersonatorUser = (user: User) => ({
  type: SET_IMPERSONATOR_USER,
  payload: {
    user,
  },
});

export const setCurrentResource = (resource: Resource) => ({
  type: SET_CURRENT_RESOURCE,
  payload: {
    resource,
  },
});
