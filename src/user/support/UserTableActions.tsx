import { PlusIcon, UserPlusIcon } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';

import { ENV } from '@waldur/core/config';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
import { isStaff } from '@waldur/workspace/selectors';

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
  const dispatch = useDispatch();
  const isStaffUser = useSelector(isStaff);

  const showEduTeams = ENV.plugins.WALDUR_AUTH_SOCIAL.REMOTE_EDUTEAMS_ENABLED;

  if (!isStaffUser && !showEduTeams) {
    return null;
  }

  const openCreateDialog = () => {
    dispatch(
      openModalDialog(UserFormDialog, {
        size: 'lg',
        resolve: { refetch },
      }),
    );
  };

  const openAddRemoteDialog = () => {
    dispatch(openModalDialog(AddRemoteUserDialog, { resolve: { refetch } }));
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
