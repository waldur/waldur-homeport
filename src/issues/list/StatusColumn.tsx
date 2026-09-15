import { FunctionComponent } from 'react';

import { Tooltip } from 'waldur-ui';

import { IssueStatus } from '@/issues/IssueStatus';
import { RateStars } from '@/proposals/proposal/create-review/RateStars';

export const StatusColumn: FunctionComponent<{ row }> = ({ row }) => (
  <span className="d-inline-flex align-items-center gap-2">
    <IssueStatus status={row.status} />
    {row.feedback ? (
      <Tooltip
        label={`${row.feedback.evaluation_number} - ${row.feedback.comment}`}
      >
        <RateStars
          count={10}
          size={14}
          value={row.feedback.evaluation_number}
        />
      </Tooltip>
    ) : null}
  </span>
);
