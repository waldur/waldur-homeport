import { UserCheckIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import {
  callReviewerPoolsForceAccept,
  CallReviewerPool,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

type CallReviewerPoolExtended = CallReviewerPool & {
  coi_count?: number;
  coi_by_severity?: Record<string, number>;
  reviews_in_progress?: number;
  reviews_completed?: number;
  override_reason?: string;
  overridden_by_name?: string;
  invitation_link?: string | null;
};

interface ForceAcceptInvitationActionProps {
  row: CallReviewerPoolExtended;
  refetch: () => void;
}

export const ForceAcceptInvitationAction: FC<
  ForceAcceptInvitationActionProps
> = ({ row, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, any>({
    mutationFn: (result) =>
      callReviewerPoolsForceAccept({
        path: { uuid: row.uuid },
        body: { override_reason: result?.input || '' },
      }),
    confirmation: {
      title: translate('Force accept invitation'),
      body: translate(
        'This will force-accept the invitation for reviewer "{reviewer}", bypassing the normal invitation flow. A reason is required for audit purposes.',
        {
          reviewer:
            row.reviewer_name || row.invited_email || row.reviewer_email,
        },
      ),
      options: {
        showInput: true,
        inputLabel: translate('Override reason'),
        inputRequired: true,
        positiveButton: translate('Force accept'),
        positiveButtonVariant: 'warning',
        size: 'lg',
      },
    },
    refetch,
    successMessage: translate('Invitation force-accepted.'),
    errorMessage: translate('Failed to force-accept invitation.'),
  });

  return (
    <ActionItem
      title={translate('Force accept')}
      action={mutate}
      iconNode={<UserCheckIcon weight="bold" />}
      iconColor="warning"
      className="text-warning"
      disabled={isPending}
    />
  );
};
