import { createSelector } from 'reselect';

import { AtLeast } from '@/core/types';
import { PermissionEnum, RoleEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
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
  customer: AtLeast<Customer, 'uuid'>,
  user: User,
): boolean =>
  !!customer?.uuid &&
  !!user?.permissions?.find(
    (permission) =>
      permission.role_name === RoleEnum.CUSTOMER_MANAGER &&
      permission.customer_uuid === customer.uuid,
  );

/**
 * Any role on a service provider belonging to the organization, custom roles
 * included. Only such a role can make the organization "manager only", so it is
 * a cheap pre-check before asking Mastermind for the flag.
 */
export const checkHasServiceProviderRole = (
  customer: AtLeast<Customer, 'uuid'>,
  user: User,
): boolean =>
  !!customer?.uuid &&
  !!user?.permissions?.some(
    (permission) =>
      permission.scope_type === 'service_provider' &&
      permission.customer_uuid === customer.uuid,
  );

/**
 * Mastermind flags an organization the user reaches only through a role on its
 * service provider, and returns only its identity (waldur/waldur-mastermind#396).
 * The organization's own pages have nothing to show such a user, who belongs in
 * the provider workspace instead. Read the flag rather than deriving it from
 * `user.permissions`: those cannot tell which roles make an organization
 * visible (an offering role does not, a resource role does).
 */
export const checkIsServiceManagerOnly = (
  customer: Pick<Customer, 'is_service_provider_manager_only'> | undefined,
): boolean => !!customer?.is_service_provider_manager_only;

export const isServiceManagerOnly = (state: RootState): boolean =>
  checkIsServiceManagerOnly(getCustomer(state));

export const checkIsOwnerOrStaff = (
  customer: AtLeast<Customer, 'uuid'>,
  user: User,
): boolean => {
  if (user && user.is_staff) {
    return true;
  }
  return customer && checkIsOwner(customer, user);
};

/**
 * Permissions that are only exercised on the provider side of an
 * organization. Holding any of them on the organization is what Mastermind
 * asks of a provider view, so a custom role carrying them (a least-privilege
 * provider operator, say) must reach the provider workspace without being made
 * an owner or a service provider manager. REGISTER is left out: it is used to
 * become a provider, not to run one. ORDER.* and RESOURCE.* are left out too,
 * even APPROVE, REJECT and UPDATE_OPTIONS: on an organization they are also
 * consumer-side rights (approving the organization's own orders, editing
 * options of resources it consumes), so they would open the workspace to a
 * role that never acts as the provider.
 */
const SERVICE_PROVIDER_ACCESS_PERMISSIONS: string[] = Object.values(
  PermissionEnum,
).filter(
  (permission) =>
    permission.startsWith('SERVICE_PROVIDER.') &&
    permission !== PermissionEnum.REGISTER_SERVICE_PROVIDER,
);

/**
 * May the user open the service provider workspace of this organization?
 * Owners and service provider managers always may; anyone else needs a
 * provider-side permission on the organization. What each page then shows is
 * still decided by its own permission checks.
 */
export const checkCanAccessServiceProvider = (
  customer: AtLeast<Customer, 'uuid'>,
  user: User,
): boolean =>
  checkIsOwnerOrStaff(customer, user) ||
  checkIsServiceManager(customer, user) ||
  (!!customer?.uuid &&
    SERVICE_PROVIDER_ACCESS_PERMISSIONS.some((permission) =>
      hasPermission(user, { permission, customerId: customer.uuid }),
    ));

/**
 * Route guard for the whole provider workspace (`/providers/:uuid/`). Hiding
 * the Service provider tab is not enough: a typed address would still open the
 * workspace and its unguarded pages. Support keeps it, as before any guard.
 */
export const canAccessServiceProviderWorkspace = (state: RootState): boolean =>
  checkIsStaffOrSupport(getUser(state)) ||
  checkCanAccessServiceProvider(getCustomer(state), getUser(state));

/**
 * Route guard for an offering's manage and edit pages. The provider workspace
 * still may. So may OFFERING.UPDATE on this offering or on its organization.
 * Both ids come from the route params the permission hook forwards: the guard
 * runs before the page resolves its organization, so the store still holds
 * whichever one was open before.
 */
export const canAccessProviderOffering = (
  state: RootState,
  transition?: { params: () => { uuid?: string; offering_uuid?: string } },
): boolean => {
  const params = transition?.params();
  return (
    canAccessServiceProviderWorkspace(state) ||
    !!hasPermission(getUser(state), {
      permission: PermissionEnum.UPDATE_OFFERING,
      customerId: params?.uuid ?? getCustomer(state)?.uuid,
      offeringId: params?.offering_uuid,
    })
  );
};

/**
 * Does the user hold `permission` on the provider organization? Support staff
 * always do, as they had every provider tab before any tab was guarded.
 */
export const checkServiceProviderPermission = (
  customer: AtLeast<Customer, 'uuid'>,
  user: User,
  permission: string,
): boolean =>
  checkIsStaffOrSupport(user) ||
  (!!customer?.uuid &&
    !!hasPermission(user, { permission, customerId: customer.uuid }));

/** Route guard for a provider workspace tab backed by one permission. */
export const hasServiceProviderPermission =
  (permission: string) =>
  (state: RootState): boolean =>
    checkServiceProviderPermission(
      getCustomer(state),
      getUser(state),
      permission,
    );

/**
 * Route guard for the provider Team tab. Mastermind shows a provider's team to
 * anyone holding a role on the ServiceProvider itself, or CUSTOMER.VIEW_TEAM on
 * its organization; a custom provider role without either would open an empty
 * list.
 */
export const canViewServiceProviderTeam = (state: RootState): boolean =>
  checkHasServiceProviderRole(getCustomer(state), getUser(state)) ||
  hasServiceProviderPermission(PermissionEnum.VIEW_CUSTOMER_TEAM)(state);

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
