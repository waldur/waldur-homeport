import { FC } from 'react';
import { CallReviewerPool } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ReviewerStandingBadge } from '@/reviewer/ReviewerStandingBadge';

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
        <div className="font-medium text-primary flex items-center gap-1.5">
          {row.reviewer_name}
          <ReviewerStandingBadge standing={row.reviewer_standing} />
        </div>
        <div className="text-quaternary">{row.reviewer_email}</div>
      </div>
    );
  }

  // Email invitation without profile
  return (
    <div>
      <div className="font-medium text-primary">
        {row.invited_email || row.reviewer_email}
      </div>
      {row.invited_user_name && (
        <div className="text-quaternary">
          {translate('Matched user: {name}', {
            name: row.invited_user_name,
          })}
        </div>
      )}
    </div>
  );
};
