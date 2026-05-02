import { PlusIcon, UserPlusIcon } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';

import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';
import { isStaff } from '@/workspace/selectors';

const AddRemoteUserDialog = lazyComponent(() =>
  import('./AddRemoteUserDialog').then((module) => ({
    default: module.AddRemoteUserDialog,
  })),
);

const UserFormDialog = lazyComponent(() =>
  import('./UserFormDialog').then((module) => ({
    default: module.UserFormDialog,
  })),
);

export const UserTableActions = ({ refetch }) => {
  const { openDialog } = useModal();
  const isStaffUser = useSelector(isStaff);

  const showEduTeams = ENV.plugins.WALDUR_AUTH_SOCIAL.REMOTE_EDUTEAMS_ENABLED;

  if (!isStaffUser && !showEduTeams) {
    return null;
  }

  const openCreateDialog = () => {
    openDialog(UserFormDialog, {
      size: 'lg',
      resolve: { refetch },
    });
  };

  const openAddRemoteDialog = () => {
    openDialog(AddRemoteUserDialog, { resolve: { refetch } });
  };

  return (
    <>
      {isStaffUser && (
        <ActionButton
          action={openCreateDialog}
          className="me-3"
          iconNode={<UserPlusIcon weight="bold" />}
          title={translate('Create user')}
        />
      )}
      {showEduTeams && (
        <ActionButton
          action={openAddRemoteDialog}
          className="me-3"
          iconNode={<PlusIcon weight="bold" />}
          title={translate('Add user')}
        />
      )}
    </>
  );
};
