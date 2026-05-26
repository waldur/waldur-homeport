import { PaperPlaneTiltIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { proposalProtectedCallsSendInvitations } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call } from '@/proposals/types';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';

interface SendInvitationsActionProps {
  call: Call;
  refetch: () => void;
}

export const SendInvitationsAction: FC<SendInvitationsActionProps> = ({
  call,
  refetch,
}) => {
  const { showSuccess, showError } = useNotify();

  const { mutate: handleSendInvitations, isPending: isSending } =
    useManagedMutation<any, any, void>({
      mutationFn: () =>
        proposalProtectedCallsSendInvitations({
          path: { uuid: call.uuid },
        }),
      onSuccess: (response) => {
        const data = response.data as { invitations_sent: number };
        if (data.invitations_sent > 0) {
          showSuccess(
            translate('Sent {count} invitations.', {
              count: data.invitations_sent,
            }),
          );
        } else {
          showError(
            translate(
              'No invitations sent. Please confirm some suggestions first.',
            ),
          );
        }
      },
      errorMessage: translate('Unable to send invitations.'),
      refetch,
    });

  return (
    <ActionItem
      title={
        isSending
          ? translate('Sending...')
          : translate('Send confirmed invitations')
      }
      action={() => handleSendInvitations()}
      disabled={isSending}
      iconNode={<PaperPlaneTiltIcon weight="bold" />}
    />
  );
};
