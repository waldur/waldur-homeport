import { XIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { CallReviewerPool, callReviewerPoolsDecline } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { CompactActionButton } from '@/table/CompactActionButton';

interface DeclineInvitationActionProps {
  row: CallReviewerPool;
}

export const DeclineInvitationAction: FC<DeclineInvitationActionProps> = ({
  row,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      callReviewerPoolsDecline({
        path: { uuid: row.uuid },
        body: { reason: translate('User declined') },
      }),
    successMessage: translate('Invitation declined.'),
    errorMessage: translate('Unable to decline invitation.'),
    invalidateQueries: [
      { queryKey: ['table', 'MyInvitationsTable'] },
      { queryKey: ['invitations-pending-count-tabs'] },
    ],
    confirmation: {
      title: translate('Decline invitation'),
      body: translate(
        'Are you sure you want to decline this invitation to review proposals for "{call}"?\n\nBy declining, you will not receive proposal assignments for this call. You can be re-invited later if needed.',
        { call: row.call_name },
      ),
      options: {
        positiveButton: translate('Decline'),
        positiveButtonVariant: 'danger',
      },
    },
  });

  return (
    <CompactActionButton
      action={mutate}
      title={translate('Decline')}
      iconNode={<XIcon weight="bold" />}
      variant="outline-danger"
      pending={isPending}
    />
  );
};
