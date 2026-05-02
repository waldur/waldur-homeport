import { ShareIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { userInvitationsSend } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';
import { getCustomer, getProject } from '@/workspace/selectors';

import { InvitationPolicyService } from './InvitationPolicyService';

const statesForResend = ['pending', 'expired', 'canceled'];

export const InvitationSendButton = ({ row, refetch }) => {
  const user = useUser();
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);

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
