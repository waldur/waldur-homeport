import { FunctionComponent, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionButton } from '@waldur/table/ActionButton';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { InvitationPolicyService } from './InvitationPolicyService';

const GroupInvitationCreateDialog = lazyComponent(
  () => import('./GroupInvitationCreateDialog'),
  'GroupInvitationCreateDialog',
);

export const GroupInvitationCreateButton: FunctionComponent<{
  refetch(): void;
}> = ({ refetch }) => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const dispatch = useDispatch();
  const roles = useMemo(
    () =>
      ENV.roles.filter((role) =>
        InvitationPolicyService.canManageRole(
          {
            customer,
            user,
            roleTypes: ['customer', 'project'],
          },
          role,
        ),
      ),
    [customer, user],
  );
  const callback = () =>
    dispatch(
      openModalDialog(GroupInvitationCreateDialog, {
        resolve: {
          refetch,
          roles,
        },
        initialValues: {
          role: roles[0],
        },
      }),
    );

  const disabled = !hasPermission(user, {
    permission: PermissionEnum.CREATE_CUSTOMER_PERMISSION,
    customerId: customer.uuid,
  });
  return (
    <ActionButton
      action={callback}
      title={translate('Create group invitation')}
      icon="fa fa-plus"
      variant="primary"
      disabled={disabled}
      tooltip={disabled && translate('You can not create group invitations.')}
    />
  );
};
