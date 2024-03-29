import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
import {
  getCustomer,
  getUser,
  isOwnerOrStaff as isOwnerOrStaffSelector,
} from '@waldur/workspace/selectors';

const GroupInvitationCreateDialog = lazyComponent(
  () => import('./GroupInvitationCreateDialog'),
  'GroupInvitationCreateDialog',
);

export const GroupInvitationCreateButton: FunctionComponent<{
  refetch(): void;
}> = ({ refetch }) => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(GroupInvitationCreateDialog, {
        resolve: {
          context: {
            customer,
            user,
            refetch,
          },
        },
      }),
    );
  return (
    <ActionButton
      action={callback}
      title={translate('Create group invitation')}
      icon="fa fa-plus"
      variant="primary"
      disabled={!isOwnerOrStaff}
      tooltip={
        !isOwnerOrStaff && translate('You can not create group invitations.')
      }
    />
  );
};
