import { ENV } from '@waldur/configs/default';
import { User } from '@waldur/workspace/types';

import { PermissionRequest, RoleType } from './types';

export function checkScope(
  user: User,
  targetScopeType: RoleType,
  targetScopeId,
  targetPerm,
) {
  if (user.is_staff) {
    return true;
  }
  const userRole = user.permissions?.find(
    ({ scope_uuid, scope_type }) =>
      scope_uuid === targetScopeId && scope_type === targetScopeType,
  );
  if (userRole) {
    const role = ENV.roles.find(({ name }) => name === userRole.role_name);
    if (role && role.permissions.includes(targetPerm)) {
      return true;
    }
  }
}

export const hasPermission = (user: User, request: PermissionRequest) => {
  if (user.is_staff) {
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
