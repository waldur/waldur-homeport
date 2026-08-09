import { StateIndicator } from '@/core/StateIndicator';

import { formatOwnReviewState, getReviewStateBadgeVariant } from '../utils';

/**
 * State of a review as its own reviewer sees it — what they still owe rather
 * than what the proposal is going through.
 */
export const OwnReviewStateRenderer = (props) => (
  <StateIndicator
    variant={getReviewStateBadgeVariant(props.row.state)}
    label={formatOwnReviewState(props.row.state)}
    outline
    pill
  />
);
