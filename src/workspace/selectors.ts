import { createSelector } from 'reselect';

import { AtLeast } from '@/core/types';
import { RoleEnum } from '@/permissions/enums';
import { type RootState } from '@/store/reducers';

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

export const checkIsStaffOrSupport = (user: User): boolean =>
  user && (user.is_staff || user.is_support);

export const isStaffOrSupport = (state: RootState): boolean =>
  checkIsStaffOrSupport(getUser(state));

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

/**
 * "Service provider manager" (CUSTOMER.MANAGER) is granted on the
 * ServiceProvider object, not on its customer, so the permission's `scope_type`
 * is 'service_provider' and its `scope_uuid` is the provider's. Matching
 * `scope_uuid` against a customer therefore never held, and this returned false
 * for every service provider manager there is. The organisation the provider
 * belongs to is reported alongside as `customer_uuid`, which is what to match.
 */
export const checkIsServiceManager = (
  customer: Customer,
  user: User,
): boolean =>
  !!customer?.uuid &&
  !!user?.permissions?.find(
    (permission) =>
      permission.role_name === RoleEnum.CUSTOMER_MANAGER &&
      permission.customer_uuid === customer.uuid,
  );

export const checkIsOwnerOrStaff = (
  customer: AtLeast<Customer, 'uuid'>,
  user: User,
): boolean => {
  if (user && user.is_staff) {
    return true;
  }
  return customer && checkIsOwner(customer, user);
};

const checkIsReader = (
  customer: AtLeast<Customer, 'uuid'>,
  user: User,
): boolean =>
  !!user?.permissions?.find(
    (permission) =>
      permission.scope_type === 'customer' &&
      permission.scope_uuid === customer?.uuid &&
      permission.role_name === RoleEnum.CUSTOMER_READER,
  );

export const isOwner = createSelector(getCustomer, getUser, checkIsOwner);

export const isOwnerOrStaff = createSelector(
  getCustomer,
  getUser,
  checkIsOwnerOrStaff,
);

/**
 * Organisation readers hold a read-only role, so they belong wherever a page
 * only displays organisation data and offers no way to change it.
 */
export const isOwnerOrStaffOrReader = createSelector(
  getCustomer,
  getUser,
  (customer, user) =>
    checkIsOwnerOrStaff(customer, user) || checkIsReader(customer, user),
);

/**
 * Check if user has access to any organization
 * (either as owner, manager, or staff)
 */
const checkHasAnyOrganizationAccess = (user: User): boolean => {
  if (!user) return false;
  if (user.is_staff || user.is_support) return true;
  return user.permissions?.some((p) => p.scope_type === 'customer') ?? false;
};

export const hasAnyOrganizationAccess = (state: RootState): boolean =>
  checkHasAnyOrganizationAccess(getUser(state));

// Check if user has any non-project permissions
export const checkHasNonProjectPermissions = (user: User): boolean => {
  if (!user) return false;
  if (user.is_staff || user.is_support) return true;
  return user.permissions?.some((p) => p.scope_type !== 'project') ?? false;
};

export const hasNonProjectPermissions = (state: RootState): boolean =>
  checkHasNonProjectPermissions(getUser(state));

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
        // CUSTOMER.MANAGER is scoped to a ServiceProvider, never to a customer
        // — see checkIsServiceManager.
        p.role_name === RoleEnum.CUSTOMER_MANAGER ||
        (p.scope_type === 'customer' &&
          p.role_name === RoleEnum.CUSTOMER_OWNER),
    ) ?? false
  );
};
