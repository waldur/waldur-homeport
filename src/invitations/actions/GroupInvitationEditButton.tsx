import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { GroupInvitation } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';
import { getCustomer } from '@/workspace/selectors';

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
  const customer = useSelector(getCustomer);
  const { openDialog } = useModal();

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
          ) && role.is_active,
      ),
    [customer, user],
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
