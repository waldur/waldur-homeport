import { FC, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { InvitationPolicyService } from './InvitationPolicyService';

const GroupInvitationCreateDialog = lazyComponent(
  () => import('./GroupInvitationCreateDialog'),
  'GroupInvitationCreateDialog',
);

export const GroupInvitationCreateButton: FC<{
  refetch(): void;
}> = ({ refetch }) => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const dispatch = useDispatch();
  const roles = useMemo(
    () =>
      ENV.roles.filter(
        (role) =>
          InvitationPolicyService.canManageRole(
            {
              customer,
              user,
              roleTypes: ['customer', 'project'],
            },
            role,
          ) && role.is_active, // Enabling/disabling roles toggles their 'is_active' property; therefore, we filter based on that property
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

  const canManage =
    hasPermission(user, {
      permission: PermissionEnum.CREATE_CUSTOMER_PERMISSION,
      customerId: customer.uuid,
    }) ||
    hasPermission(user, {
      permission: PermissionEnum.CREATE_PROJECT_PERMISSION,
      customerId: customer.uuid,
    });
  return (
    <AddButton
      action={callback}
      disabled={!canManage}
      tooltip={!canManage && translate('You can not create group invitations.')}
    />
  );
};
