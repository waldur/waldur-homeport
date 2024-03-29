import { createSelector } from 'reselect';

import { RoleEnum } from '@waldur/permissions/enums';
import { RootState } from '@waldur/store/reducers';

import {
  User,
  Customer,
  Project,
  WorkspaceType,
  CustomerPermission,
  ProjectPermission,
} from './types';

export const getUser = (state: RootState): User => state.workspace.user;

export const getCustomer = (state: RootState): Customer =>
  state.workspace.customer;

export const getResource = (state: RootState) => state.workspace.resource;

export const getUserCustomerPermissions = createSelector(
  getUser,
  (user: User): CustomerPermission[] => {
    if (user) {
      return user.customer_permissions;
    }
    return [];
  },
);

export const getUserProjectPermissions = createSelector(
  getUser,
  (user: User): ProjectPermission[] => {
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
  customer.owners?.find((owner) => owner.uuid === user.uuid) !== undefined;

export const checkIsServiceManager = (
  customer: Customer,
  user: User,
): boolean =>
  user &&
  customer?.service_managers?.find((manager) => manager.uuid === user.uuid) !==
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
      return customer.owners?.find((owner) => owner.uuid === user.uuid);
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

export const filterByUser = (state: RootState) => ({
  user_url: getUser(state)?.url,
});

export const isProjectManagerSelector = (user, project) =>
  user.permissions?.find(
    (permission) =>
      permission.scope_type === 'project' &&
      permission.scope_uuid === project?.uuid &&
      permission.role_name === RoleEnum.PROJECT_MANAGER,
  );
