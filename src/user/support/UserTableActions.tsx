import { PlusIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/core/config';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const AddRemoteUserDialog = lazyComponent(() =>
  import('./AddRemoteUserDialog').then((module) => ({
    default: module.AddRemoteUserDialog,
  })),
);

export const UserTableActions = ({ refetch }) => {
  const dispatch = useDispatch();
  if (!ENV.plugins.WALDUR_AUTH_SOCIAL.REMOTE_EDUTEAMS_ENABLED) {
    return null;
  }
  const openDialog = () => {
    dispatch(openModalDialog(AddRemoteUserDialog, { resolve: { refetch } }));
  };
  return (
    <ActionButton
      action={openDialog}
      className="me-3"
      iconNode={<PlusIcon weight="bold" />}
      title={translate('Add user')}
    />
  );
};
