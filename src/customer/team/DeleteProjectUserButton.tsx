import { TrashIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch } from 'react-redux';
import {
  CustomerUser,
  NestedProjectPermission,
  projectsDeleteUser,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface DeleteProjectUserButtonProps {
  customer: CustomerUser;
  project: NestedProjectPermission;
  refetch(): void;
}

export const DeleteProjectUserButton: React.FC<
  DeleteProjectUserButtonProps
> = ({ project, customer, refetch }) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to remove {user} from {project}?', {
          user: customer.full_name || customer.username,
          project: project.name,
        }),
      );
    } catch {
      return;
    }

    try {
      await projectsDeleteUser({
        path: { uuid: project.uuid },
        body: {
          user: customer.uuid,
          role: project.role_name,
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
      className="text-danger border-top"
      iconColor="danger"
      title={translate('Remove')}
      action={callback}
      iconNode={<TrashIcon weight="bold" />}
    />
  );
};
