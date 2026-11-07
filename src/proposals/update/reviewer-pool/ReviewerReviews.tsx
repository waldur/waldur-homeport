import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { Call } from '@/proposals/types';
import * as tableActions from '@/table/actions';

import { CallReviewerPoolExtended } from './types';

interface ReviewerReviewsProps {
  row: CallReviewerPoolExtended;
  call: Call;
}

/**
 * A reviewer's review counts in words, as a link to the call's Reviews tab
 * filtered to the reviewer.
 */
export const ReviewerReviews: FC<ReviewerReviewsProps> = ({ row, call }) => {
  const dispatch = useDispatch();
  const inProgress = row.reviews_in_progress || 0;
  const completed = row.reviews_completed || 0;
  if (inProgress + completed === 0) {
    return <span className="text-quaternary">-</span>;
  }
  // The list's own reviewer filter, as its column's inline filter sets it.
  const table = `CallReviewsList-${call.uuid}`;
  const filterToReviewer = () => {
    dispatch(
      tableActions.setFilter(table, {
        name: 'reviewer',
        value: { full_name: row.reviewer_name, uuid: row.reviewer_user_uuid },
        label: null,
        component: null,
      }),
    );
    dispatch(tableActions.resetPagination(table));
  };
  return (
    <Link
      state="protected-call.manage"
      params={{ call_uuid: call.uuid, tab: 'reviews' }}
      onClick={filterToReviewer}
      label={translate('{inProgress} in progress, {completed} completed', {
        inProgress,
        completed,
      })}
    />
  );
};
