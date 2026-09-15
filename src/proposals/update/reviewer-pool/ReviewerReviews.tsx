import { FC } from 'react';

import { Tooltip } from 'waldur-ui';

import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';

import { CallReviewerPoolExtended } from './types';

interface ReviewerReviewsProps {
  row: CallReviewerPoolExtended;
}

export const ReviewerReviews: FC<ReviewerReviewsProps> = ({ row }) => {
  const inProgress = row.reviews_in_progress || 0;
  const completed = row.reviews_completed || 0;
  const total = inProgress + completed;

  if (total === 0) {
    return <span className="text-muted">-</span>;
  }

  return (
    <div className="d-flex gap-1">
      {inProgress > 0 && (
        <Tooltip label={translate('In progress')}>
          <Badge variant="warning" pill outline>
            {inProgress}
          </Badge>
        </Tooltip>
      )}
      {completed > 0 && (
        <Tooltip label={translate('Completed')}>
          <Badge variant="success" pill outline>
            {completed}
          </Badge>
        </Tooltip>
      )}
    </div>
  );
};
