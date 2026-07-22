import { projectsListUsersList } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { RoleEnum } from '@/permissions/enums';
import { Role } from '@/permissions/types';

export const isOnlyOneProjectManagerEnabled = (): boolean =>
  Boolean(ENV.plugins.WALDUR_CORE?.ONLY_ONE_PROJECT_MANAGER);

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
  role?: Pick<Role, 'name'> | null,
): boolean => role?.name === RoleEnum.PROJECT_MANAGER;

export const isProjectManagerSelectionBlocked = (
  hasActiveManager: boolean | undefined,
  role?: Pick<Role, 'name'> | null,
  currentRoleName?: string,
): boolean => {
  if (!isOnlyOneProjectManagerEnabled() || !hasActiveManager) {
    return false;
  }
  if (!isProjectManagerRole(role)) {
    return false;
  }
  if (currentRoleName === RoleEnum.PROJECT_MANAGER) {
    return false;
  }
  return true;
};

export const projectHasActiveManager = async (
  projectUuid: string,
): Promise<boolean> => {
  const response = await projectsListUsersList({
    path: { uuid: projectUuid },
    query: {
      role: [RoleEnum.PROJECT_MANAGER],
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
