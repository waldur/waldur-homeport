import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { InvitationContext } from '../types';

const InvitationCreateDialog = lazyComponent(
  () => import('./InvitationCreateDialog'),
  'InvitationCreateDialog',
);

export const InvitationCreateButton: FunctionComponent<
  Omit<InvitationContext, 'customer' | 'user'>
> = (context) => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(InvitationCreateDialog, {
        size: 'xl',
        resolve: { ...context, user, customer },
      }),
    );
  return (
    <ActionButton
      action={callback}
      title={translate('Invite user')}
      icon="fa fa-plus"
      variant="primary"
    />
  );
};
