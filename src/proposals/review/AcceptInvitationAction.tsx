import { CheckIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { CallReviewerPool, callReviewerPoolsAccept } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { CompactActionButton } from '@/table/CompactActionButton';

interface AcceptInvitationActionProps {
  row: CallReviewerPool;
}

export const AcceptInvitationAction: FC<AcceptInvitationActionProps> = ({
  row,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      callReviewerPoolsAccept({
        path: { uuid: row.uuid },
        body: [], // Empty array for no COI declarations
      }),
    successMessage: translate('Invitation accepted.'),
    errorMessage: translate('Unable to accept invitation.'),
    invalidateQueries: [
      { queryKey: ['table', 'MyInvitationsTable'] },
      { queryKey: ['invitations-pending-count-tabs'] },
    ],
    confirmation: {
      title: translate('Accept invitation'),
      body: translate(
        'By accepting this invitation to review proposals for "{call}", you agree to:\n\n• Review assigned proposals within the specified deadlines\n• Maintain confidentiality of proposal contents\n• Declare any conflicts of interest',
        { call: row.call_name },
      ),
      options: {
        positiveButton: translate('Accept'),
        positiveButtonVariant: 'primary',
      },
    },
  });

  return (
    <CompactActionButton
      action={mutate}
      title={translate('Accept')}
      iconNode={<CheckIcon weight="bold" />}
      variant="success"
      pending={isPending}
    />
  );
};
