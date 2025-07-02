import { TrashIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { customersDeleteUser, projectsDeleteUser } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { useUser } from '@waldur/workspace/hooks';
import { getCustomer } from '@waldur/workspace/selectors';

export const UsersBulkRemoveButton = ({ rows, refetch }) => {
  const currentUser = useUser();
  const currentCustomer = useSelector(getCustomer);
  const canRemoveUsers = hasPermission(currentUser, {
    permission: PermissionEnum.DELETE_CUSTOMER_PERMISSION,
    customerId: currentCustomer.uuid,
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
          {row.full_name || row.username} ({row.email || '-'})
        </li>
      ));

      const confirmationText = translate(
        "You are about to remove these users from the organization. Once removed, they'll immediately lose access and all associated permissions.",
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
          'Remove selected users from the organization: {customerName}',
          {
            customerName: <strong>{currentCustomer.name}</strong>,
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
        try {
          await Promise.all(
            user.projects.map((project) =>
              projectsDeleteUser({
                path: { uuid: project.uuid },
                body: {
                  user: user.uuid,
                  role: project.role_name,
                },
              }),
            ),
          );

          if (user.role_name) {
            await customersDeleteUser({
              path: { uuid: currentCustomer.uuid },
              body: {
                user: user.uuid,
                role: user.role_name,
              },
            });
          }
        } catch (e) {
          dispatch(
            showErrorResponse(
              e,
              translate('Unable to remove user {userName}.', {
                userName: user.full_name || user.username,
              }),
            ),
          );
        }
      }
      await refetch();
      dispatch(
        showSuccess(
          translate('Selected users have been successfully removed.'),
        ),
      );
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to remove users.')));
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <ActionButton
      title={translate('Remove')}
      action={callback}
      iconNode={<TrashIcon />}
      variant="light-danger"
      tooltip={translate('Remove all selected users from organization.')}
      disabled={isRemoving}
    />
  );
};
