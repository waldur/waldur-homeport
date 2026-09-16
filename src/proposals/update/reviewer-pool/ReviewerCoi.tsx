import { FC } from 'react';

import { Badge } from 'waldur-ui';

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
        <Badge variant="danger" shape="pill" tone="outline">
          {bySeverity.real}
        </Badge>
      )}
      {bySeverity.apparent > 0 && (
        <Badge variant="warning" shape="pill" tone="outline">
          {bySeverity.apparent}
        </Badge>
      )}
      {bySeverity.potential > 0 && (
        <Badge variant="info" shape="pill" tone="outline">
          {bySeverity.potential}
        </Badge>
      )}
    </div>
  );
};
