import { FC } from 'react';

import { Badge } from '@/core/Badge';

import { CallReviewerPoolExtended } from './types';

interface ReviewerCoiProps {
  row: CallReviewerPoolExtended;
}

export const ReviewerCoi: FC<ReviewerCoiProps> = ({ row }) => {
  const coiCount = row.coi_count || 0;

  if (coiCount === 0) {
    return <span className="text-muted">-</span>;
  }

  const bySeverity = row.coi_by_severity || {};

  return (
    <div className="d-flex gap-1">
      {bySeverity.real > 0 && (
        <Badge variant="danger" pill outline>
          {bySeverity.real}
        </Badge>
      )}
      {bySeverity.apparent > 0 && (
        <Badge variant="warning" pill outline>
          {bySeverity.apparent}
        </Badge>
      )}
      {bySeverity.potential > 0 && (
        <Badge variant="info" pill outline>
          {bySeverity.potential}
        </Badge>
      )}
    </div>
  );
};
