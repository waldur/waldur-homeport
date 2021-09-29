import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

const AddRemoteUserDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "AddRemoteUserDialog" */ './AddRemoteUserDialog'
    ),
  'AddRemoteUserDialog',
);

export const UserTableActions = ({ refreshList }) => {
  const dispatch = useDispatch();
  if (!ENV.plugins.WALDUR_AUTH_SOCIAL.REMOTE_EDUTEAMS_ENABLED) {
    return null;
  }
  const openDialog = () => {
    dispatch(
      openModalDialog(AddRemoteUserDialog, { resolve: { refreshList } }),
    );
  };
  return (
    <Button onClick={openDialog} bsSize="small">
      <i className="fa fa-plus" />{' '}
      {translate('Add {provider} user', {
        provider: ENV.plugins.WALDUR_AUTH_SOCIAL.EDUTEAMS_LABEL,
      })}
    </Button>
  );
};
