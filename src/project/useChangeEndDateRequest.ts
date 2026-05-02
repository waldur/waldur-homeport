import { useCallback, useMemo } from 'react';
import { Project } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { isProjectMember } from '@/permissions/isProjectMember';
import { useUser } from '@/workspace/hooks';

import { ChangeEndDateRequestFlowDialog } from './ChangeEndDateRequestFlowDialog';

/**
 * Same visibility and dialog as {@link ChangeEndDateAction}: project member
 * without UPDATE_PROJECT can request an end date change.
 */
export function useChangeEndDateRequest(project: Project, refetch: () => void) {
  const user = useUser();
  const { openDialog } = useModal();

  const hasUpdatePermission = useMemo(
    () =>
      hasPermission(user, {
        permission: PermissionEnum.UPDATE_PROJECT,
        projectId: project.uuid,
      }) ||
      hasPermission(user, {
        permission: PermissionEnum.UPDATE_PROJECT,
        customerId: project.customer_uuid,
      }),
    [user, project.uuid, project.customer_uuid],
  );

  const isMember = useMemo(
    () => isProjectMember(user, project.uuid),
    [user, project.uuid],
  );

  const showRequest = !hasUpdatePermission && isMember;

  const open = useCallback(() => {
    openDialog(ChangeEndDateRequestFlowDialog, {
      resolve: { project, refetch },
    });
  }, [project, refetch]);

  return { showRequest, open };
}
