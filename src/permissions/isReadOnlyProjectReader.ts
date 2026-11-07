import { User } from 'waldur-js-client';

import { canAccessProjectDashboard } from './canAccessProjectDashboard';
import { RoleEnum } from './enums';

/**
 * True when the user reads ``project`` without any role on it or on its
 * organisation, as the manager of a call: the backend lets a call manager read
 * (and only read) the projects the call's accepted proposals were allocated,
 * and in them only the resources the allocation provisioned; project-wide
 * figures cover those resources alone. Other call roles (reviewers, panel
 * members) get no such access.
 *
 * The user's roles cannot say which projects a call allocated, so this only
 * means something for a project the backend has already returned to the user;
 * a project it refused never reaches the page that asks.
 */
export const isReadOnlyProjectReader = (
  user: User | null | undefined,
  project: { uuid: string; customer_uuid?: string } | null | undefined,
): boolean => {
  if (!user || !project) {
    return false;
  }
  if (canAccessProjectDashboard(user, project.uuid, project.customer_uuid)) {
    return false;
  }
  return (
    user.permissions?.some(
      (p) => p.scope_type === 'call' && p.role_name === RoleEnum.CALL_MANAGER,
    ) ?? false
  );
};
