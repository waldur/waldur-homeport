import { createSelector } from 'reselect';

import { User, Customer, Project, OuterState } from './types';

export const getUser = (state: OuterState): User =>
  state.workspace.user;

export const getCustomer = (state: OuterState): Customer =>
  state.workspace.customer;

export const getProject = (state: OuterState): Project =>
  state.workspace.project;

export const isStaff = (state: OuterState): boolean =>
  getUser(state) && getUser(state).is_staff;

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
  }
);

export const isOwner = createSelector(
  getOwner,
  owner => {
    return !!owner;
  }
);

export const isOwnerOrStaff = createSelector(
  getUser,
  isOwner,
  (user, userIsOwner) => {
    if (user.is_staff) {
      return true;
    }
    return userIsOwner;
  }
);

const checkRole = (project, user, role) => {
  const projectUser = project.permissions.find(perm => perm.user_uuid === user.uuid);
  if (projectUser) {
    return projectUser.role === role;
  }
};

export const isManager = createSelector(
  getUser,
  getProject,
  (user, project) => {
    return checkRole(project, user, 'manager');
  }
);

export const isAdmin = createSelector(
  getUser,
  getProject,
  (user, project) => {
    return checkRole(project, user, 'admin');
  }
);

export const canManageCustomer = (state: any): boolean =>
  state.config.ownerCanManageCustomer;

export const canCreateOrganization = (state: OuterState): boolean =>
  isStaff(state) || canManageCustomer(state);

export const filterByUser = (state: OuterState) => ({
  user_url: getUser(state).url,
});
