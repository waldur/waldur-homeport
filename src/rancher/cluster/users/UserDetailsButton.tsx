import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const UserDetailsDialog = lazyComponent(
  () =>
    import(/* webpackChunkName: "UserDetailsDialog" */ './UserDetailsDialog'),
  'UserDetailsDialog',
);

export const UserDetailsButton: FunctionComponent<{ user }> = ({ user }) => {
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
