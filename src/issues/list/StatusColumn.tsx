import { FunctionComponent } from 'react';

import { Tip } from '@waldur/core/Tooltip';
import { IssueTypeIcon } from '@waldur/issues/types/IssueTypeIcon';
import { RateStars } from '@waldur/proposals/proposal/create-review/RateStars';
import { renderFieldOrDash } from '@waldur/table/utils';

export const StatusColumn: FunctionComponent<{ row }> = ({ row }) => (
  <>
    <IssueTypeIcon type={row.type} /> {renderFieldOrDash(row.status)}
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
  </>
);
