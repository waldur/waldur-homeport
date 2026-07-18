import { UsersThreeIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { rolesList } from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser, useCustomer } from '@/workspace/hooks';

import { InvitationPolicyService } from './InvitationPolicyService';

const GroupInvitationCreateDialog = lazyComponent(() =>
  import('./GroupInvitationCreateDialog').then((module) => ({
    default: module.GroupInvitationCreateDialog,
  })),
);

export const GroupInvitationCreateButton: FC<{
  refetch(): void;
}> = ({ refetch }) => {
  const user = useUser();
  const customer = useCustomer();
  const { openDialog } = useModal();
  // Offer this organization's roles (system + org-private clones, minus
  // concealed) rather than the global ENV.roles list, so group invitations
  // respect the same org scoping as the other invite/add-member pickers.
  const { data: scopedRoles } = useQuery({
    queryKey: ['available-roles-for-customer', customer?.uuid],
    queryFn: () =>
      getAllPages((page) =>
        rolesList({ query: { available_for_customer: customer.uuid, page } }),
      ),
    enabled: Boolean(customer?.uuid),
    staleTime: 5 * 60 * 1000,
  });
  const roles = useMemo(
    () =>
      (scopedRoles ?? []).filter(
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
    [scopedRoles, customer, user],
  );
  const callback = () =>
    openDialog(GroupInvitationCreateDialog, {
      resolve: {
        refetch,
        roles,
      },
      initialValues: {
        role: roles[0],
        type: 'private',
      },
    });

  const canManage =
    hasPermission(user, {
      permission: PermissionEnum.CREATE_CUSTOMER_PERMISSION,
      customerId: customer.uuid,
    }) ||
    hasPermission(user, {
      permission: PermissionEnum.CREATE_PROJECT_PERMISSION,
      customerId: customer.uuid,
    });

  if (ENV.plugins.WALDUR_CORE.INVITATION_USE_WEBHOOKS) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Group invitation')}
      action={callback}
      iconNode={<UsersThreeIcon weight="bold" />}
      disabled={!canManage}
      tooltip={!canManage && translate('You can not create group invitations.')}
    />
  );
};
