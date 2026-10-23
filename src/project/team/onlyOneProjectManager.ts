import { projectsListUsersList } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { RoleEnum } from '@/permissions/enums';
import { Role } from '@/permissions/types';

export const isOnlyOneProjectManagerEnabled = (): boolean =>
  Boolean(ENV.plugins.WALDUR_CORE?.ONLY_ONE_PROJECT_MANAGER);

/** The system project-manager role, or an organization's copy of it. */
const isProjectManagerName = (roleName?: string | null): boolean =>
  Boolean(
    roleName &&
    (roleName === RoleEnum.PROJECT_MANAGER ||
      ENV.roles?.find(({ name }) => name === roleName)?.template_name ===
        RoleEnum.PROJECT_MANAGER),
  );

const getProjectManagerRoleLabel = (): string => {
  const role = ENV.roles.find((r) => r.name === RoleEnum.PROJECT_MANAGER);
  return role?.description || role?.name || RoleEnum.PROJECT_MANAGER;
};

export const getOnlyOneProjectManagerTooltip = (): string =>
  translate(
    'This project already has an active {role}. Only one {role} per project is allowed.',
    { role: getProjectManagerRoleLabel() },
  );

export const isProjectManagerRole = (
  role?: { name?: string; template_name?: string | null } | null,
): boolean =>
  role?.name === RoleEnum.PROJECT_MANAGER ||
  role?.template_name === RoleEnum.PROJECT_MANAGER;

export const isProjectManagerSelectionBlocked = (
  hasActiveManager: boolean | undefined,
  role?: { name?: string; template_name?: string | null } | null,
  currentRoleName?: string,
): boolean => {
  if (!isOnlyOneProjectManagerEnabled() || !hasActiveManager) {
    return false;
  }
  if (!isProjectManagerRole(role)) {
    return false;
  }
  // A member who already holds the system role, or an organization's copy of
  // it, is editing that grant. The name of a copy is not PROJECT.MANAGER.
  if (currentRoleName && isProjectManagerName(currentRoleName)) {
    return false;
  }
  return true;
};

/** Role names and uuids list_users should treat as a project manager. */
const projectManagerRoleQuery = (): string[] => {
  const roles = new Set<string>([RoleEnum.PROJECT_MANAGER]);
  for (const role of ENV.roles ?? []) {
    if (isProjectManagerName(role.name)) {
      if (role.uuid) {
        roles.add(role.uuid);
      }
      if (role.name) {
        roles.add(role.name);
      }
    }
  }
  return [...roles];
};

export const projectHasActiveManager = async (
  projectUuid: string,
): Promise<boolean> => {
  // list_users matches role names exactly, so an organization's copy is not
  // found by PROJECT.MANAGER alone. Ask for every cached copy as well.
  const response = await projectsListUsersList({
    path: { uuid: projectUuid },
    query: {
      role: projectManagerRoleQuery(),
      page_size: 1,
      field: ['role_name'],
    },
  });
  return (response.data?.length ?? 0) > 0;
};

export const projectHasActiveManagerQueryKey = (projectUuid?: string) =>
  ['project-has-active-manager', projectUuid] as const;

export const isInvitationRowProjectManagerBlocked = (
  row: {
    role_project?: {
      role?: Pick<Role, 'name'> | null;
      project?: { uuid?: string } | null;
    } | null;
  },
  managerMap: Map<string, boolean>,
  fallbackProjectUuid?: string,
): boolean => {
  if (!isOnlyOneProjectManagerEnabled()) {
    return false;
  }
  if (!isProjectManagerRole(row?.role_project?.role)) {
    return false;
  }
  const projectUuid = row.role_project?.project?.uuid ?? fallbackProjectUuid;
  if (!projectUuid) {
    return false;
  }
  return managerMap.get(projectUuid) === true;
};
