import { createSelector } from 'reselect';

import { AtLeast } from '@waldur/core/types';
import { RoleEnum } from '@waldur/permissions/enums';
import { type RootState } from '@waldur/store/reducers';

import { Customer, Project, User } from './types';

export const getUser = (state: RootState): User => state.workspace.user;

export const getImpersonatorUser = (state: RootState): User =>
  state.workspace.impersonatorUser;

export const getCustomer = (state: RootState): Customer =>
  state.workspace.customer;

export const getResource = (state: RootState) => state.workspace.resource;

export const getProject = (state: RootState): Project =>
  state.workspace.project;

export const isStaff = (state: RootState): boolean =>
  getUser(state) && getUser(state).is_staff;

export const isSupport = (state: RootState): boolean =>
  getUser(state) && getUser(state).is_support;

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

/**
 * Check if user has access to any organization
 * (either as owner, manager, or staff)
 */
export const hasAnyOrganizationAccess = (state: RootState): boolean => {
  const user = getUser(state);
  if (!user) return false;
  if (user.is_staff || user.is_support) return true;
  return user.permissions?.some((p) => p.scope_type === 'customer') ?? false;
};

/**
 * Check if user manages any service provider offerings
 */
export const isServiceProviderManager = (state: RootState): boolean => {
  const user = getUser(state);
  if (!user) return false;
  if (user.is_staff) return true;
  return (
    user.permissions?.some(
      (p) =>
        p.scope_type === 'customer' &&
        (p.role_name === RoleEnum.CUSTOMER_OWNER ||
          p.role_name === RoleEnum.CUSTOMER_MANAGER),
    ) ?? false
  );
};

/**
 * Check if user is a call manager for any organization
 */
export const isCallManager = (state: RootState): boolean => {
  const user = getUser(state);
  if (!user) return false;
  if (user.is_staff) return true;
  return (
    user.permissions?.some((p) => p.role_name === RoleEnum.CALL_MANAGER) ??
    false
  );
};

/**
 * Check if user can access reporting (any role-based access)
 */
export const canAccessReporting = (state: RootState): boolean => {
  const user = getUser(state);
  if (!user) return false;
  if (user.is_staff || user.is_support) return true;
  return hasAnyOrganizationAccess(state);
};
