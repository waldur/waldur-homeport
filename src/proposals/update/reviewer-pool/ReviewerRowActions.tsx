import { CopyIcon, ListChecksIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Call } from '@/proposals/types';
import { ActionItem } from '@/resource/actions/ActionItem';
import { isInGoodStanding } from '@/reviewer/ReviewerStandingBadge';
import { useNotify } from '@/store/notify';
import { ActionsMenu } from '@/table/ActionsDropdown';

import { ForceAcceptInvitationAction } from './ForceAcceptInvitationAction';
import {
  RESEND_INVITATION_STATUSES,
  ResendInvitationAction,
} from './ResendInvitationAction';
import { CallReviewerPoolExtended } from './types';

const ReviewerReviewsDialog = lazyComponent(() =>
  import('./ReviewerReviewsDialog').then((m) => ({
    default: m.ReviewerReviewsDialog,
  })),
);

const FORCE_ACCEPT_STATUSES = ['pending', 'declined', 'expired'];

interface ReviewerRowActionsProps {
  row: CallReviewerPoolExtended;
  call: Call;
  refetch: () => void;
  /** Force-accept and resend write to the pool; viewers without
   * MANAGE_PROPOSAL_REVIEW keep only the read-side copy action. */
  canManage: boolean;
}

export const ReviewerRowActions: FC<ReviewerRowActionsProps> = ({
  row,
  call,
  refetch,
  canManage,
}) => {
  const { showSuccess } = useNotify();
  const { openDialog } = useModal();
  const showReviews =
    (row.reviews_in_progress || 0) + (row.reviews_completed || 0) > 0;

  const showCopyLink = !!row.invitation_link;
  const showForceAccept =
    canManage &&
    FORCE_ACCEPT_STATUSES.includes(row.invitation_status) &&
    !!row.reviewer_uuid &&
    // The operator's standing is not the call manager's to override.
    isInGoodStanding(row.reviewer_standing);
  const showResend =
    canManage && RESEND_INVITATION_STATUSES.includes(row.invitation_status);

  if (!showReviews && !showCopyLink && !showForceAccept && !showResend) {
    return (
      <ActionsMenu size="sm" disabled tooltip>
        {null}
      </ActionsMenu>
    );
  }

  return (
    <ActionsMenu size="sm">
      {showReviews && (
        <ActionItem
          title={translate('Show reviews')}
          action={() =>
            openDialog(ReviewerReviewsDialog, {
              resolve: { call, row },
              size: 'lg',
            })
          }
          iconNode={<ListChecksIcon weight="bold" />}
        />
      )}
      {showCopyLink && (
        <ActionItem
          title={translate('Copy invitation link')}
          action={() => {
            const link = `${location.origin}${row.invitation_link}`;
            navigator.clipboard.writeText(link).then(() => {
              showSuccess(translate('Invitation link has been copied'));
            });
          }}
          iconNode={<CopyIcon weight="bold" />}
        />
      )}
      {showResend && <ResendInvitationAction row={row} refetch={refetch} />}
      {showForceAccept && (
        <ForceAcceptInvitationAction row={row} refetch={refetch} />
      )}
    </ActionsMenu>
  );
};
