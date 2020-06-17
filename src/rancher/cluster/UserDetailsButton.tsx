import * as React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { UserDetailsDialog } from '@waldur/rancher/cluster/UserDetailsDialog';
import { ActionButton } from '@waldur/table-react/ActionButton';

export const UserDetailsButton = ({ user }) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(UserDetailsDialog, {
        resolve: {
          user: user,
        },
      }),
    );
  return (
    <ActionButton
      action={callback}
      title={translate('Details')}
      icon="fa fa-eye"
    />
  );
};
