import { TrashIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { projectsDeleteUser } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { useUser } from '@waldur/workspace/hooks';
import { getProject } from '@waldur/workspace/selectors';

export const ProjectUsersBulkRemoveButton = ({ rows, refetch }) => {
  const currentUser = useUser();
  const project = useSelector(getProject);
  const canRemoveUsers = hasPermission(currentUser, {
    permission: PermissionEnum.DELETE_PROJECT_PERMISSION,
    projectId: project.uuid,
  });
  if (!canRemoveUsers) {
    return null;
  }

  const [isRemoving, setIsRemoving] = useState(false);
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      const userList = rows.map((row) => (
        <li key={row.uuid}>
          {row.user_full_name || row.user_username} ({row.user_email || '-'})
        </li>
      ));

      const confirmationText = translate(
        "You are about to remove these users from the project. Once removed, they'll immediately lose access and all associated permissions.",
      );

      const formattedMessage = (
        <div>
          <p>{confirmationText}</p>
          <ul>{userList}</ul>
        </div>
      );

      await waitForConfirmation(
        dispatch,
        translate(
          'Remove selected users from the project: {projectName}',
          {
            projectName: <strong>{project.name}</strong>,
          },
          formatJsxTemplate,
        ),
        formattedMessage,
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      setIsRemoving(true);
      for (const user of rows) {
        await projectsDeleteUser({
          path: { uuid: project.uuid },
          body: {
            user: user.user_uuid,
            role: user.role_name,
          },
        });
      }
      refetch();
      dispatch(
        showSuccess(
          translate('Users have been removed from project successfully.'),
        ),
      );
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to remove users from project.'),
        ),
      );
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <ActionButton
      title={translate('Remove')}
      action={callback}
      iconNode={<TrashIcon weight="bold" />}
      variant="light-danger"
      tooltip={translate('Remove all selected users from project.')}
      disabled={isRemoving}
    />
  );
};
