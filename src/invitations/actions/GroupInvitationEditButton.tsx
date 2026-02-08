import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GroupInvitation } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

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
          ) && role.is_active,
      ),
    [customer, user],
  );

  const callback = () =>
    dispatch(
      openModalDialog(GroupInvitationEditDialog, {
        resolve: {
          refetch,
          roles,
          invitation: row,
        },
      }),
    );

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
