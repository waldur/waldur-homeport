import * as React from 'react';
import ReactStars from 'react-rating-stars-component';

import { Tooltip } from '@waldur/core/Tooltip';
import { IssueTypeIcon } from '@waldur/issues/types/IssueTypeIcon';

export const StatusColumn = ({ row }) => (
  <>
    <IssueTypeIcon type={row.type} /> {row.status || 'N/A'}
    {row.feedback ? (
      <Tooltip
        id="feedback-tooltip"
        label={`${row.feedback.evaluation_number} - ${row.feedback.comment}`}
      >
        <ReactStars
          count={5}
          size={14}
          edit={false}
          isHalf={true}
          activeColor="#ffd700"
          value={row.feedback.evaluation_number}
        />
      </Tooltip>
    ) : null}
  </>
);
