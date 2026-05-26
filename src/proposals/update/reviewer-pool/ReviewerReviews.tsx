import { FC } from 'react';

import { Badge } from '@/core/Badge';
import { Tip } from '@/core/Tooltip';
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
        <Tip id={`in-progress-${row.uuid}`} label={translate('In progress')}>
          <Badge variant="warning" pill outline>
            {inProgress}
          </Badge>
        </Tip>
      )}
      {completed > 0 && (
        <Tip id={`completed-${row.uuid}`} label={translate('Completed')}>
          <Badge variant="success" pill outline>
            {completed}
          </Badge>
        </Tip>
      )}
    </div>
  );
};
