import { ProhibitIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { userInvitationsCancel } from 'waldur-js-client';

import { Menu } from 'waldur-ui';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useUser, useCustomer, useProject } from '@/workspace/hooks';

import { InvitationPolicyService } from './InvitationPolicyService';

export const InvitationCancelButton = ({ row, refetch }) => {
  const user = useUser();
  const customer = useCustomer();
  const project = useProject();

  const { mutate, isPending } = useManagedMutation({
    mutationFn: () => userInvitationsCancel({ path: { uuid: row.uuid } }),
    successMessage: translate('Invitation has been canceled.'),
    errorMessage: translate('Unable to cancel invitation.'),
    refetch,
  });

  const isDisabled = useMemo(() => {
    if (
      !InvitationPolicyService.canManageInvitation(
        { user, customer, project },
        row,
      )
    ) {
      return true;
    }
    if (row.state !== 'pending' && row.state !== 'project') {
      return true;
    }
    return false;
  }, [user, customer, row]);

  const tooltip = useMemo(() => {
    if (
      !InvitationPolicyService.canManageInvitation(
        { user, customer, project },
        row,
      )
    ) {
      return translate("You don't have permission to cancel this invitation.");
    }

    if (row.state !== 'pending' && row.state !== 'project') {
      return translate('Only pending or planned invitations can be canceled.');
    }
  }, [user, customer, row]);

  return (
    <Menu.Item
      onSelect={() => mutate()}
      icon={<ProhibitIcon weight="bold" />}
      disabled={isDisabled || isPending}
      tooltip={tooltip}
    >
      {translate('Cancel')}
    </Menu.Item>
  );
};
