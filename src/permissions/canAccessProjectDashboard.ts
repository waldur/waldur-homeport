import { User } from 'waldur-js-client';

import { PermissionEnum } from './enums';
import { hasPermission } from './hasPermission';

export const canAccessProjectDashboard = (
  user: User | null | undefined,
  projectUuid: string,
  customerUuid?: string,
): boolean => {
  if (!user) {
    return false;
  }
  if (user.is_staff || user.is_support) {
    return true;
  }

  if (
    user.permissions?.some(
      (p) => p.scope_type === 'project' && p.scope_uuid === projectUuid,
    )
  ) {
    return true;
  }

  if (
    customerUuid &&
    user.permissions?.some(
      (p) => p.scope_type === 'customer' && p.scope_uuid === customerUuid,
    )
  ) {
    return true;
  }

  return Boolean(
    hasPermission(user, {
      permission: PermissionEnum.LIST_PROJECTS,
      projectId: projectUuid,
      customerId: customerUuid,
    }),
  );
};
