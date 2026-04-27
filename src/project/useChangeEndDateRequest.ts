import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Project } from 'waldur-js-client';

import { openModalDialog } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { isProjectMember } from '@/permissions/isProjectMember';
import { getUser } from '@/workspace/selectors';

import { ChangeEndDateRequestFlowDialog } from './ChangeEndDateRequestFlowDialog';

/**
 * Same visibility and dialog as {@link ChangeEndDateAction}: project member
 * without UPDATE_PROJECT can request an end date change.
 */
export function useChangeEndDateRequest(project: Project, refetch: () => void) {
  const dispatch = useDispatch();
  const user = useSelector(getUser);

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
    dispatch(
      openModalDialog(ChangeEndDateRequestFlowDialog, {
        resolve: { project, refetch },
      }),
    );
  }, [dispatch, project, refetch]);

  return { showRequest, open };
}
