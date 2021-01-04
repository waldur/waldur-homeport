import { createSelector } from 'reselect';

import {
  PROJECT_ADMIN_ROLE,
  PROJECT_MANAGER_ROLE,
} from '@waldur/core/constants';
import { RootState } from '@waldur/store/reducers';

import { User, Customer, Project, WorkspaceType } from './types';

export const getUser = (state: RootState): User => state.workspace.user;

export const getCustomer = (state: RootState): Customer =>
  state.workspace.customer;

export const getUserCustomerPermissions = createSelector(
  getUser,
  (user: User) => {
    if (user) {
      return user.customer_permissions;
    }
    return [];
  },
);

export const getUserProjectPermissions = createSelector(
  getUser,
  (user: User) => {
    if (user) {
      return user.project_permissions;
    }
    return [];
  },
);

export const getProject = (state: RootState): Project =>
  state.workspace.project;

export const getWorkspace = (state: RootState): WorkspaceType =>
  state.workspace.workspace;

export const isStaff = (state: RootState): boolean =>
  getUser(state) && getUser(state).is_staff;

export const isSupport = (state: RootState): boolean =>
  getUser(state) && getUser(state).is_support;

export const isSupportOnly = (state: RootState): boolean =>
  isSupport(state) &&
  !isStaff(state) &&
  !checkIsOwner(state.workspace.customer, state.workspace.user) &&
  !checkIsServiceManager(state.workspace.customer, state.workspace.user);

export const isStaffOrSupport = (state: RootState): boolean =>
  isStaff(state) || isSupport(state);

export const checkIsOwner = (customer: Customer, user: User): boolean =>
  customer &&
  user &&
  customer.owners.find((owner) => owner.uuid === user.uuid) !== undefined;

export const checkIsServiceManager = (
  customer: Customer,
  user: User,
): boolean =>
  customer &&
  user &&
  customer.service_managers.find((manager) => manager.uuid === user.uuid) !==
    undefined;

export const checkCustomerUser = (customer: Customer, user: User): boolean => {
  if (user && user.is_staff) {
    return true;
  }
  return customer && checkIsOwner(customer, user);
};

export const getOwner = createSelector(
  getUser,
  getCustomer,
  (user: User, customer: Customer) => {
    if (!user) {
      return undefined;
    }
    if (customer) {
      return customer.owners.find((owner) => owner.uuid === user.uuid);
    }
  },
);

export const isServiceManagerSelector = createSelector(
  getCustomer,
  getUser,
  checkIsServiceManager,
);

export const isOwner = createSelector(getOwner, (owner) => {
  return !!owner;
});

export const isOwnerOrStaff = createSelector(
  getUser,
  isOwner,
  (user: User, userIsOwner: boolean): boolean => {
    if (!user) {
      return false;
    }
    if (user.is_staff) {
      return true;
    }
    return userIsOwner;
  },
);

const checkRole = (project: Project, user: User, role: string) => {
  if (!project.permissions) {
    return false;
  }
  const projectUser = project.permissions.find(
    (perm) => perm.user_uuid === user.uuid,
  );
  if (projectUser) {
    return projectUser.role === role;
  }
};

export const isManager = createSelector(
  getUser,
  getProject,
  (user: User, project: Project): boolean => {
    return project && checkRole(project, user, PROJECT_MANAGER_ROLE);
  },
);

export const isAdmin = createSelector(
  getUser,
  getProject,
  (user: User, project: Project): boolean => {
    return checkRole(project, user, PROJECT_ADMIN_ROLE);
  },
);

export const filterByUser = (state: RootState) => ({
  user_url: getUser(state)?.url,
});
