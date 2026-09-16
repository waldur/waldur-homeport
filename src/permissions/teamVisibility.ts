import { User } from 'waldur-js-client';

import { RootState } from '@/store/reducers';
import { getCustomer, getProject, getUser } from '@/workspace/selectors';

import { PermissionEnum } from './enums';
import { hasPermission } from './hasPermission';

type TeamViewer = Pick<User, 'is_staff' | 'is_support' | 'permissions'>;

interface TeamScope {
  customerId?: string | null;
  projectId?: string | null;
}

/**
 * May the user list the members of an organization or of one of its projects?
 *
 * Mirrors the backend check behind the team listing endpoints: staff and
 * support always may; anyone else needs CUSTOMER.VIEW_TEAM on the organization,
 * or PROJECT.VIEW_TEAM on the project or on any other project of the same
 * organization. A role without the permission (a reader or an SRAM placeholder
 * role, say) gets a 403 there, so the Team tab is hidden instead.
 */
export const canViewTeam = (
  user: TeamViewer | null | undefined,
  { customerId, projectId }: TeamScope,
): boolean => {
  if (!user) return false;
  if (user.is_staff || user.is_support) return true;
  if (
    customerId &&
    hasPermission(user, {
      permission: PermissionEnum.VIEW_CUSTOMER_TEAM,
      customerId,
    })
  ) {
    return true;
  }
  if (
    projectId &&
    hasPermission(user, {
      permission: PermissionEnum.VIEW_PROJECT_TEAM,
      projectId,
    })
  ) {
    return true;
  }
  if (!customerId) return false;
  return (user.permissions ?? []).some(
    (permission) =>
      permission.scope_type === 'project' &&
      permission.customer_uuid === customerId &&
      Boolean(
        hasPermission(user, {
          permission: PermissionEnum.VIEW_PROJECT_TEAM,
          projectId: permission.scope_uuid,
        }),
      ),
  );
};

/** Route predicate for the organization Team tab. */
export const canViewCustomerTeam = (state: RootState): boolean =>
  canViewTeam(getUser(state), { customerId: getCustomer(state)?.uuid });

/** Route predicate for the project Team tab. */
export const canViewProjectTeam = (state: RootState): boolean => {
  const project = getProject(state);
  return canViewTeam(getUser(state), {
    customerId: project?.customer_uuid,
    projectId: project?.uuid,
  });
};
