import { useCallback, useMemo } from 'react';
import { Project } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { isProjectMember } from '@/permissions/isProjectMember';
import { useUser } from '@/workspace/hooks';

import { ChangeEndDateRequestFlowDialog } from './ChangeEndDateRequestFlowDialog';

export const canRequestProjectEndDateChange = (
  user: Parameters<typeof isProjectMember>[0] | null | undefined,
  project: Pick<Project, 'uuid' | 'customer_uuid'>,
): boolean => {
  const canEdit =
    hasPermission(user, {
      permission: PermissionEnum.UPDATE_PROJECT,
      projectId: project.uuid,
    }) ||
    hasPermission(user, {
      permission: PermissionEnum.UPDATE_PROJECT,
      customerId: project.customer_uuid,
    });
  if (canEdit) {
    return false;
  }
  // A role on the project can request without PROJECT.LIST. Anyone else must
  // see this project: PROJECT.LIST on it, on its organization, or site-wide.
  if (isProjectMember(user, project.uuid)) {
    return true;
  }
  return Boolean(
    hasPermission(user, {
      permission: PermissionEnum.LIST_PROJECTS,
      projectId: project.uuid,
      customerId: project.customer_uuid,
    }),
  );
};

export function useChangeEndDateRequest(project: Project, refetch: () => void) {
  const user = useUser();
  const { openDialog } = useModal();

  const showRequest = useMemo(
    () => canRequestProjectEndDateChange(user, project),
    [user, project],
  );

  const open = useCallback(() => {
    openDialog(ChangeEndDateRequestFlowDialog, {
      resolve: { project, refetch },
    });
  }, [project, refetch]);

  return { showRequest, open };
}
