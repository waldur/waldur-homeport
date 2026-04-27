import { TrashIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { projectsDeleteUser } from 'waldur-js-client';

import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { GenericPermission } from '@/permissions/types';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { useUser } from '@/workspace/hooks';
import { getCustomer, getProject } from '@/workspace/selectors';

interface UserRemoveButtonProps {
  row: GenericPermission;
  refetch(): void;
  projectUuid?;
  customerUuid?;
}

export const UserRemoveButton: React.FC<UserRemoveButtonProps> = ({
  row: permission,
  refetch,
  projectUuid,
  customerUuid,
}) => {
  const dispatch = useDispatch();
  const user = useUser();
  const project = useSelector(getProject);
  const customer = useSelector(getCustomer);

  const hasContext = projectUuid || customerUuid;
  const projectId = hasContext ? projectUuid : project?.uuid;
  const customerId = hasContext ? customerUuid : customer?.uuid;

  if (
    !hasPermission(user, {
      permission: PermissionEnum.DELETE_PROJECT_PERMISSION,
      customerId,
      projectId,
    })
  ) {
    return null;
  }

  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to remove {userName}?', {
          userName: permission.user_full_name || permission.user_username,
        }),
      );
    } catch {
      return;
    }

    try {
      await projectsDeleteUser({
        path: { uuid: projectId },
        body: {
          user: permission.user_uuid,
          role: permission.role_name,
        },
      });
      refetch();
      dispatch(showSuccess(translate('Team member has been removed.')));
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to delete team member.')),
      );
    }
  };
  return (
    <ActionItem
      action={callback}
      title={translate('Remove')}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
      size="sm"
    />
  );
};
