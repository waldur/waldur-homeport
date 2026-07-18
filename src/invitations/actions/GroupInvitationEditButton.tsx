import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { GroupInvitation, rolesList } from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser, useCustomer } from '@/workspace/hooks';

import { InvitationPolicyService } from './InvitationPolicyService';

const GroupInvitationEditDialog = lazyComponent(() =>
  import('./GroupInvitationEditDialog').then((module) => ({
    default: module.GroupInvitationEditDialog,
  })),
);

export const GroupInvitationEditButton: FC<{
  row: GroupInvitation;
  refetch(): void;
}> = ({ row, refetch }) => {
  const user = useUser();
  const customer = useCustomer();
  const { openDialog } = useModal();

  // Offer this organization's roles (system + org-private clones, minus
  // concealed) rather than the global ENV.roles list, matching the group
  // invitation create dialog and the other invite/add-member pickers.
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
          ) && role.is_active,
      ),
    [scopedRoles, customer, user],
  );

  const callback = () =>
    openDialog(GroupInvitationEditDialog, {
      resolve: {
        refetch,
        roles,
        invitation: row,
      },
    });

  return (
    <ActionItem
      title={translate('Edit')}
      action={callback}
      iconNode={<PencilSimpleIcon weight="bold" />}
      disabled={!row.is_active}
      tooltip={
        !row.is_active && translate('Only active invitations can be edited')
      }
    />
  );
};
