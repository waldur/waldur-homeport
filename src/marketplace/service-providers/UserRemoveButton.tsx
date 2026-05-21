import { FC } from 'react';
import { marketplaceServiceProvidersDeleteUser } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { GenericPermission } from '@/permissions/types';
import { getPermissionDisabledTooltip } from '@/permissions/utils';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { useUser, useCustomer } from '@/workspace/hooks';

interface UserRemoveButtonProps {
  user: GenericPermission;
  refetch;
}

export const UserRemoveButton: FC<UserRemoveButtonProps> = ({
  user,
  refetch,
}) => {
  const currentUser = useUser();
  const currentCustomer = useCustomer();

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceServiceProvidersDeleteUser({
        path: { uuid: currentCustomer.service_provider_uuid },
        body: {
          user: user.user_uuid,
          role: user.role_name,
        },
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

  const disabled = !hasPermission(currentUser, {
    permission: PermissionEnum.DELETE_CUSTOMER_PERMISSION,
    customerId: currentCustomer.uuid,
  });

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={disabled || isPending}
      tooltip={
        disabled &&
        getPermissionDisabledTooltip(
          PermissionEnum.DELETE_CUSTOMER_PERMISSION,
          ['customer'],
        )
      }
    />
  );
};
