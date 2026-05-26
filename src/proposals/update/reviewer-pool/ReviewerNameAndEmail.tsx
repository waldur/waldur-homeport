import { FC } from 'react';
import { CallReviewerPool } from 'waldur-js-client';

import { translate } from '@/i18n';

interface ReviewerNameAndEmailProps {
  row: CallReviewerPool;
}

export const ReviewerNameAndEmail: FC<ReviewerNameAndEmailProps> = ({
  row,
}) => {
  // Handle nullable reviewer (email invitations before profile is created)
  const hasProfile = row.has_profile !== false && row.reviewer_uuid;

  if (hasProfile) {
    return (
      <div>
        <div className="fw-bold">{row.reviewer_name}</div>
        <small className="text-muted">{row.reviewer_email}</small>
      </div>
    );
  }

  // Email invitation without profile
  return (
    <div>
      <div className="fw-bold">{row.invited_email || row.reviewer_email}</div>
      {row.invited_user_name && (
        <div className="text-muted small mt-1">
          {translate('Matched user: {name}', {
            name: row.invited_user_name,
          })}
        </div>
      )}
    </div>
  );
};
