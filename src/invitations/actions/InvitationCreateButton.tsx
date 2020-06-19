import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
import {
  getUser,
  isOwnerOrStaff as isOwnerOrStaffSelector,
  getCustomer,
} from '@waldur/workspace/selectors';

import { InvitationCreateDialog } from './InvitationCreateDialog';

export const InvitationCreateButton = () => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(InvitationCreateDialog, {
        resolve: {
          context: {
            customer,
            user,
          },
        },
      }),
    );
  return (
    <ActionButton
      action={callback}
      title={translate('Invite user')}
      icon="fa fa-plus"
      disabled={!isOwnerOrStaff}
      tooltip={
        !isOwnerOrStaff &&
        translate('Only customer owner or staff can invite users.')
      }
    />
  );
};
