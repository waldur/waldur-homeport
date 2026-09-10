import { User } from 'waldur-js-client';

import { ENV } from '@/core/config';

import { PermissionRequest, RoleType } from './types';

/** Does the named role carry this permission, per the roles the server sent? */
const roleGrants = (roleName: string, targetPerm) =>
  !!ENV.roles
    .find(({ name }) => name === roleName)
    ?.permissions.includes(targetPerm);

export function checkScope(
  user: Pick<User, 'is_staff' | 'permissions'>,
  targetScopeType: RoleType,
  targetScopeId,
  targetPerm,
) {
  if (!user) {
    return false;
  }
  if (user?.is_staff) {
    return true;
  }
  const userRole = user.permissions?.find(
    ({ scope_uuid, scope_type }) =>
      scope_uuid === targetScopeId && scope_type === targetScopeType,
  );
  if (userRole && roleGrants(userRole.role_name, targetPerm)) {
    return true;
  }
}

/**
 * Roles granted on a ServiceProvider rather than on a customer — "Service
 * provider manager" (CUSTOMER.MANAGER) is the one that exists today. Their
 * `scope_uuid` is the provider's, so a `customerId` request never matched them
 * and every provider-side gate stayed shut for the people who run the provider.
 * They are keyed here on the organisation the provider belongs to, which
 * /api/users/me reports as `customer_uuid`. Only the permissions the role
 * actually carries are granted, so this widens who is asked, not what is given.
 */
function checkServiceProviderScope(
  user: Pick<User, 'is_staff' | 'permissions'>,
  customerId,
  targetPerm,
) {
  return !!user?.permissions?.some(
    (permission) =>
      permission.scope_type === 'service_provider' &&
      permission.customer_uuid === customerId &&
      roleGrants(permission.role_name, targetPerm),
  );
}

export const hasPermission = (
  user: Pick<User, 'is_staff' | 'permissions'>,
  request: PermissionRequest,
) => {
  if (user?.is_staff) {
    return true;
  }
  if (request.projectId) {
    if (checkScope(user, 'project', request.projectId, request.permission)) {
      return true;
    }
  }
  if (request.customerId) {
    if (checkScope(user, 'customer', request.customerId, request.permission)) {
      return true;
    }
    if (
      checkServiceProviderScope(user, request.customerId, request.permission)
    ) {
      return true;
    }
  }
  if (request.callOrganizerId) {
    if (
      checkScope(
        user,
        'call_organizer',
        request.callOrganizerId,
        request.permission,
      )
    ) {
      return true;
    }
  }
  if (request.offeringId) {
    if (checkScope(user, 'offering', request.offeringId, request.permission)) {
      return true;
    }
  }
  if (request.scopeId) {
    if (
      checkScope(user, 'call', request.scopeId, request.permission) ||
      checkScope(user, 'proposal', request.scopeId, request.permission)
    ) {
      return true;
    }
  }
};

/**
 * True only if every listed permission is held in the same scope request.
 * Used by actions that need more than one right at once — for example
 * changing resource limits, which both mutates the resource and submits a
 * marketplace order.
 */
export const hasAllPermissions = (
  user: Pick<User, 'is_staff' | 'permissions'>,
  permissions: string[],
  request: Omit<PermissionRequest, 'permission'>,
): boolean =>
  permissions.every((permission) =>
    Boolean(hasPermission(user, { ...request, permission })),
  );

export const hasPermissionOnAnyCustomer = (
  user: User,
  permission: string,
): boolean => {
  if (!user) return false;
  if (user.is_staff) return true;
  return (
    user.permissions?.some((perm) => {
      if (perm.scope_type !== 'customer') return false;
      const role = ENV.roles.find(({ name }) => name === perm.role_name);
      return role?.permissions.includes(permission);
    }) ?? false
  );
};

export const hasPermissionOnAnyScope = (
  user: User,
  permission: string,
): boolean => {
  if (!user) return false;
  if (user.is_staff) return true;
  return (
    user.permissions?.some((perm) => {
      const role = ENV.roles.find(({ name }) => name === perm.role_name);
      return role?.permissions.includes(permission);
    }) ?? false
  );
};

export const userHasRole = (user: User, role: string, scope_uuid: string) => {
  if (user?.is_staff) {
    return true;
  }
  return user.permissions?.some(
    (permission) =>
      permission.role_name === role && permission.scope_uuid === scope_uuid,
  );
};
