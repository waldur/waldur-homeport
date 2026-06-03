import { FunctionComponent } from 'react';

import { Tip } from '@/core/Tooltip';
import { IssueStatus } from '@/issues/IssueStatus';
import { RateStars } from '@/proposals/proposal/create-review/RateStars';

export const StatusColumn: FunctionComponent<{ row }> = ({ row }) => (
  <span className="d-inline-flex align-items-center gap-2">
    <IssueStatus status={row.status} />
    {row.feedback ? (
      <Tip
        id="feedback-tooltip"
        label={`${row.feedback.evaluation_number} - ${row.feedback.comment}`}
      >
        <RateStars
          count={10}
          size={14}
          value={row.feedback.evaluation_number}
        />
      </Tip>
    ) : null}
  </span>
);
