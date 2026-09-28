import { PlusIcon, UserPlusIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useUser } from '@/workspace/hooks';

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
  const user = useUser();
  const isStaffUser = user?.is_staff;

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
        <BaseButton
          onClick={openCreateDialog}
          className="me-3"
          iconNode={<UserPlusIcon weight="bold" />}
          label={translate('Create user')}
          variant="tertiary"
          size="lg"
        />
      )}
      {showEduTeams && (
        <BaseButton
          onClick={openAddRemoteDialog}
          className="me-3"
          iconNode={<PlusIcon weight="bold" />}
          label={translate('Add user')}
          variant="tertiary"
          size="lg"
        />
      )}
    </>
  );
};
