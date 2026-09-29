import { PaperPlaneTiltIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { callReviewerPoolsResendInvitation } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

import { CallReviewerPoolExtended } from './types';

/** The backend sends an invitation again only while it can still be answered
 * (pending) or has lapsed unanswered (expired). */
export const RESEND_INVITATION_STATUSES = ['pending', 'expired'];

interface ResendInvitationActionProps {
  row: CallReviewerPoolExtended;
  refetch: () => void;
}

export const ResendInvitationAction: FC<ResendInvitationActionProps> = ({
  row,
  refetch,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      callReviewerPoolsResendInvitation({ path: { uuid: row.uuid } }),
    confirmation: {
      title: translate('Resend invitation'),
      body: translate(
        'A new invitation will be emailed to "{reviewer}" with a new link and expiry date. Links from earlier invitation emails will stop working.',
        {
          reviewer:
            row.reviewer_name || row.invited_email || row.reviewer_email,
        },
      ),
      options: {
        positiveButton: translate('Resend'),
      },
    },
    refetch,
    successMessage: translate('Invitation has been sent again.'),
    errorMessage: translate('Unable to resend invitation.'),
  });

  return (
    <ActionItem
      title={translate('Resend invitation')}
      action={() => mutate()}
      iconNode={<PaperPlaneTiltIcon weight="bold" />}
      disabled={isPending}
    />
  );
};
