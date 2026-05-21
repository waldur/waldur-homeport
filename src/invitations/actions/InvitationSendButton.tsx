import { ShareIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { userInvitationsSend } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser, useCustomer, useProject } from '@/workspace/hooks';

import { InvitationPolicyService } from './InvitationPolicyService';

const statesForResend = ['pending', 'expired', 'canceled'];

export const InvitationSendButton = ({ row, refetch }) => {
  const user = useUser();
  const customer = useCustomer();
  const project = useProject();

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => userInvitationsSend({ path: { uuid: row.uuid } }),
    successMessage: translate('Invitation has been sent again.'),
    errorMessage: translate('Unable to resend invitation.'),
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
    if (statesForResend.indexOf(row.state) === -1) {
      return true;
    }
    return false;
  }, [user, customer, project, row]);

  const tooltip = useMemo(() => {
    if (
      !InvitationPolicyService.canManageInvitation(
        { user, customer, project },
        row,
      )
    ) {
      return translate("You don't have permission to send this invitation.");
    }

    if (statesForResend.indexOf(row.state) === -1) {
      return translate(
        'Only pending, expired and canceled invitations can be sent again.',
      );
    }
  }, [user, customer, project, row]);

  return (
    <ActionItem
      action={mutate}
      title={translate('Resend')}
      iconNode={<ShareIcon weight="bold" />}
      disabled={isDisabled || isPending}
      tooltip={tooltip}
    />
  );
};
