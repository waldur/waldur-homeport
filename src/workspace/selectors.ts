import { createSelector } from 'reselect';

import { User, Customer, Project, OuterState, WorkspaceType } from './types';

export const getUser = (state: OuterState): User => state.workspace.user;

export const getCustomer = (state: OuterState): Customer =>
  state.workspace.customer;

export const getUserCustomerPermissions = createSelector(getUser, user => {
  if (user) {
    return user.customer_permissions;
  }
  return [];
});

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

const checkIsOwner = (customer, user) => {
  for (let i = 0; i < customer.owners.length; i++) {
    if (user && user.uuid === customer.owners[i].uuid) {
      return true;
    }
  }
  return false;
};

export const checkCustomerUser = (customer, user) => {
  if (user && user.is_staff) {
    return true;
  }
  return customer && checkIsOwner(customer, user);
};

export const getOwner = createSelector(
  getUser,
  getCustomer,
  (user, customer) => {
    if (!user) {
      return undefined;
    }
    if (customer) {
      return customer.owners.find(owner => owner.uuid === user.uuid);
    }
  },
);

export const isOwner = createSelector(getOwner, owner => {
  return !!owner;
});

export const isOwnerOrStaff = createSelector(
  getUser,
  isOwner,
  (user, userIsOwner) => {
    if (!user) {
      return false;
    }
    if (user.is_staff) {
      return true;
    }
    return userIsOwner;
  },
);

const checkRole = (project, user, role) => {
  if (!project.permissions) {
    return false;
  }
  const projectUser = project.permissions.find(
    perm => perm.user_uuid === user.uuid,
  );
  if (projectUser) {
    return projectUser.role === role;
  }
};

export const isManager = createSelector(
  getUser,
  getProject,
  (user, project) => {
    return project && checkRole(project, user, 'manager');
  },
);

export const isAdmin = createSelector(getUser, getProject, (user, project) => {
  return checkRole(project, user, 'admin');
});

export const filterByUser = (state: OuterState) => ({
  user_url: getUser(state).url,
});
