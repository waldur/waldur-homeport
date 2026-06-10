import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { usersPartialUpdate } from 'waldur-js-client';
import { User } from 'waldur-js-client';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { Panel } from '@/core/Panel';
import { formatJsxTemplate, translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';

import { UserDeactivateDialog } from './UserDeactivateDialog';

export const UserStatus = ({ user }: { user: User }) => {
  const { confirm, openDialog } = useModal();
  const queryClient = useQueryClient();
  const { showErrorResponse, showSuccess } = useNotify();
  const [isActive, setIsActive] = useState(user.is_active);

  const setLocalActive = (value: boolean) => {
    queryClient.invalidateQueries({ queryKey: ['User', user.uuid] });
    queryClient.setQueryData(
      ['User', user.uuid],
      (cachedUser: User | undefined) =>
        cachedUser
          ? { ...cachedUser, is_active: value }
          : { ...user, is_active: value },
    );
    setIsActive(value);
  };

  const toggleUserStatus = async () => {
    // Deactivation requires a reason and sets an administrative override that
    // the role-sync task will not undo, so collect it via a dedicated dialog.
    if (isActive) {
      openDialog(UserDeactivateDialog, {
        resolve: { user, onDeactivated: () => setLocalActive(false) },
      });
      return;
    }

    try {
      await confirm(
        translate('Confirmation'),
        translate(
          'Are you sure you want to activate {name}?',
          { name: <strong>{user.full_name}</strong> },
          formatJsxTemplate,
        ),
        {
          type: 'danger',
          positiveButton: translate('Activate'),
          negativeButton: translate('Cancel'),
        },
      );
    } catch {
      // swallow
      return;
    }
    try {
      await usersPartialUpdate({
        path: { uuid: user.uuid },
        body: {
          is_active: true,
        },
      });
      setLocalActive(true);
      showSuccess(translate('User has been activated.'));
    } catch (error) {
      showErrorResponse(error, translate('Unable to toggle user status.'));
    }
  };

  return (
    <Panel
      title={translate('Account status')}
      cardBordered
      actions={
        <AwesomeCheckbox
          value={isActive}
          onChange={toggleUserStatus}
          label={isActive ? translate('Active') : translate('Disabled')}
        />
      }
    >
      <ul className="text-gray-500">
        <li>{translate('Temporarily block account')}</li>
        <li>{translate('This action will disable account access')}</li>
        <li>
          {translate(
            'Blocked users are not visible to other non-operator roles',
          )}
        </li>
        <li>{translate('Blocked users cannot login into the system')}</li>
        <li>
          {translate(
            'Disabling here is an administrative override: when automatic role-based deactivation is enabled, the system will not re-enable the account automatically, even if the user regains roles. It can only be reactivated manually here.',
          )}
        </li>
      </ul>
    </Panel>
  );
};
