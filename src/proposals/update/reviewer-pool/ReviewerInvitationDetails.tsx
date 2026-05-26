import { ClockIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { CallReviewerPool } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';

interface ReviewerInvitationDetailsProps {
  row: CallReviewerPool;
}

export const ReviewerInvitationDetails: FC<ReviewerInvitationDetailsProps> = ({
  row,
}) => {
  return (
    <div>
      <div>{row.invited_at ? formatDate(row.invited_at) : '-'}</div>
      {row.invitation_expires_at && row.invitation_status === 'pending' && (
        <small className="text-muted">
          <ClockIcon size={12} className="me-1" weight="bold" />
          {translate('Expires')}: {formatDate(row.invitation_expires_at)}
        </small>
      )}
    </div>
  );
};
