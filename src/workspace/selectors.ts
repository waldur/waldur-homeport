import { createSelector } from 'reselect';

import {
  PROJECT_ADMIN_ROLE,
  PROJECT_MANAGER_ROLE,
} from '@waldur/core/constants';

import { User, Customer, Project, OuterState, WorkspaceType } from './types';

export const getUser = (state: OuterState): User => state.workspace.user;

export const getCustomer = (state: OuterState): Customer =>
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

export const getProject = (state: OuterState): Project =>
  state.workspace.project;

export const getWorkspace = (state: OuterState): WorkspaceType =>
  state.workspace.workspace;

export const isStaff = (state: OuterState): boolean =>
  getUser(state) && getUser(state).is_staff;

export const isSupport = (state: OuterState): boolean =>
  getUser(state) && getUser(state).is_support;

export const isStaffOrSupport = (state: OuterState): boolean =>
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

export const filterByUser = (state: OuterState) => ({
  user_url: getUser(state)?.url,
});
