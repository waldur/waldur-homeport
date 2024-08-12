import { Plus } from '@phosphor-icons/react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

const AddRemoteUserDialog = lazyComponent(
  () => import('./AddRemoteUserDialog'),
  'AddRemoteUserDialog',
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
    <Button onClick={openDialog} className="me-3">
      <span className="svg-icon svg-icon-2">
        <Plus />
      </span>{' '}
      {translate('Add user')}
    </Button>
  );
};
