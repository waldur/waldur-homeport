import { FunctionComponent } from 'react';
import ReactStars from 'react-rating-stars-component';

import { RATING_STAR_ACTIVE_COLOR } from '@waldur/core/constants';
import { Tip } from '@waldur/core/Tooltip';
import { IssueTypeIcon } from '@waldur/issues/types/IssueTypeIcon';

export const StatusColumn: FunctionComponent<{ row }> = ({ row }) => (
  <>
    <IssueTypeIcon type={row.type} /> {row.status || 'N/A'}
    {row.feedback ? (
      <Tip
        id="feedback-tooltip"
        label={`${row.feedback.evaluation_number} - ${row.feedback.comment}`}
      >
        <ReactStars
          count={10}
          size={14}
          edit={false}
          isHalf={true}
          activeColor={RATING_STAR_ACTIVE_COLOR}
          value={row.feedback.evaluation_number}
        />
      </Tip>
    ) : null}
  </>
);
