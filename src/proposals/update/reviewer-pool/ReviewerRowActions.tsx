import { CopyIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

import { ForceAcceptInvitationAction } from './ForceAcceptInvitationAction';
import {
  RESEND_INVITATION_STATUSES,
  ResendInvitationAction,
} from './ResendInvitationAction';
import { CallReviewerPoolExtended } from './types';

const FORCE_ACCEPT_STATUSES = ['pending', 'declined', 'expired'];

interface ReviewerRowActionsProps {
  row: CallReviewerPoolExtended;
  refetch: () => void;
  /** Force-accept and resend write to the pool; viewers without
   * MANAGE_PROPOSAL_REVIEW keep only the read-side copy action. */
  canManage: boolean;
}

export const ReviewerRowActions: FC<ReviewerRowActionsProps> = ({
  row,
  refetch,
  canManage,
}) => {
  const { showSuccess } = useNotify();

  const showCopyLink = !!row.invitation_link;
  const showForceAccept =
    canManage &&
    FORCE_ACCEPT_STATUSES.includes(row.invitation_status) &&
    !!row.reviewer_uuid;
  const showResend =
    canManage && RESEND_INVITATION_STATUSES.includes(row.invitation_status);

  if (!showCopyLink && !showForceAccept && !showResend) {
    return (
      <ActionsDropdownComponent size="sm" disabled tooltip>
        {null}
      </ActionsDropdownComponent>
    );
  }

  return (
    <ActionsDropdownComponent size="sm">
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
    </ActionsDropdownComponent>
  );
};
