import { TrashIcon } from '@phosphor-icons/react';
import React from 'react';
import { useSelector } from 'react-redux';
import {
  customersDeleteUser,
  CustomerUser,
  projectsDeleteUser,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';
import { getCustomer } from '@/workspace/selectors';

interface UserRemoveButtonProps {
  customer: CustomerUser;
  refetch;
}

export const UserRemoveButton: React.FC<UserRemoveButtonProps> = ({
  customer,
  refetch,
}) => {
  const currentUser = useUser();
  const currentCustomer = useSelector(getCustomer);

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: async () => {
      await Promise.all(
        (customer.projects || []).map((project) =>
          projectsDeleteUser({
            path: { uuid: project.uuid },
            body: {
              user: customer.uuid,
              role: project.role_name,
            },
          }),
        ),
      );
      if (customer.role_name) {
        await customersDeleteUser({
          path: { uuid: currentCustomer.uuid },
          body: {
            user: customer.uuid,
            role: customer.role_name,
          },
        });
      }
    },
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to remove {userName}?', {
        userName: customer.full_name || customer.username,
      }),
    },
    successMessage: translate('Team member has been removed.'),
    errorMessage: translate('Unable to delete team member.'),
    refetch,
  });

  if (
    !hasPermission(currentUser, {
      permission: PermissionEnum.DELETE_CUSTOMER_PERMISSION,
      customerId: currentCustomer.uuid,
    })
  ) {
    return null;
  }
  return (
    <ActionItem
      className="text-danger border-top"
      iconColor="danger"
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
      iconNode={<TrashIcon weight="bold" />}
    />
  );
};
