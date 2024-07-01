import { createSelector } from 'reselect';

import { AtLeast } from '@waldur/core/types';
import { RoleEnum } from '@waldur/permissions/enums';
import { RootState } from '@waldur/store/reducers';

import { User, Customer, Project, WorkspaceType } from './types';

export const getUser = (state: RootState): User => state.workspace.user;

export const getImpersonatorUser = (state: RootState): User =>
  state.workspace.impersonatorUser;

export const getCustomer = (state: RootState): Customer =>
  state.workspace.customer;

export const getResource = (state: RootState) => state.workspace.resource;

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

export const checkIsOwner = (
  customer: AtLeast<Customer, 'uuid'>,
  user: User,
): boolean =>
  !!user?.permissions?.find(
    (permission) =>
      permission.scope_type === 'customer' &&
      permission.scope_uuid === customer?.uuid &&
      permission.role_name === RoleEnum.CUSTOMER_OWNER,
  );

export const checkIsServiceManager = (
  customer: Customer,
  user: User,
): boolean =>
  !!user?.permissions?.find(
    (permission) =>
      permission.scope_type === 'customer' &&
      permission.scope_uuid === customer?.uuid &&
      permission.role_name === RoleEnum.CUSTOMER_MANAGER,
  );

export const checkCustomerUser = (
  customer: AtLeast<Customer, 'uuid'>,
  user: User,
): boolean => {
  if (user && user.is_staff) {
    return true;
  }
  return customer && checkIsOwner(customer, user);
};

export const isServiceManagerSelector = createSelector(
  getCustomer,
  getUser,
  checkIsServiceManager,
);

export const isOwner = createSelector(getCustomer, getUser, checkIsOwner);

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
