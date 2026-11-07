import { useCallback, useMemo } from 'react';
import { Project, User } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

import { ChangeEndDateRequestFlowDialog } from './ChangeEndDateRequestFlowDialog';

/** Mirrors the backend: asking is a permission of its own, and whoever sets
 * the date directly (and so approves requests) has nobody to ask. */
export const canRequestProjectEndDateChange = (
  user: User | null | undefined,
  project: Pick<Project, 'uuid' | 'customer_uuid'>,
): boolean => {
  if (!user || user.is_staff) {
    return false;
  }
  const scopes = { projectId: project.uuid, customerId: project.customer_uuid };
  return (
    !hasPermission(user, {
      permission: PermissionEnum.SET_PROJECT_END_DATE,
      ...scopes,
    }) &&
    Boolean(
      hasPermission(user, {
        permission: PermissionEnum.REQUEST_PROJECT_END_DATE_CHANGE,
        ...scopes,
      }),
    )
  );
};

/**
 * Same visibility and dialog as {@link ChangeEndDateAction}: whoever may ask
 * for an end date change, and cannot set the date themselves.
 */
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
