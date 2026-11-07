import { FC } from 'react';
import { callManagingOrganisationsDeleteUser } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { GenericPermission } from '@/permissions/types';
import { getPermissionDisabledTooltip } from '@/permissions/utils';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { useCustomer, useUser } from '@/workspace/hooks';

import { canManageCallOrganisers } from './UserAddButton';

interface UserRemoveButtonProps {
  user: GenericPermission;
  refetch;
}

/** Revokes a role on the organisation's call management. */
export const UserRemoveButton: FC<UserRemoveButtonProps> = ({
  user,
  refetch,
}) => {
  const currentUser = useUser();
  const customer = useCustomer();

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      callManagingOrganisationsDeleteUser({
        path: { uuid: customer.call_managing_organization_uuid },
        body: { user: user.user_uuid, role: user.role_name },
      }),
    successMessage: translate('Team member has been removed.'),
    errorMessage: translate('Unable to delete team member.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to remove {userName}?', {
        userName: user.user_full_name || user.user_username,
      }),
    },
  });

  const disabled = !canManageCallOrganisers(
    currentUser,
    customer,
    PermissionEnum.DELETE_CALL_PERMISSION,
  );

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={disabled || isPending}
      tooltip={
        disabled &&
        getPermissionDisabledTooltip(PermissionEnum.DELETE_CALL_PERMISSION, [
          'customer',
          'call_organizer',
        ])
      }
    />
  );
};
