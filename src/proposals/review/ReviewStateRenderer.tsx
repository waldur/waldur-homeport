import { StateIndicator } from '@waldur/core/StateIndicator';

import { formatReviewState, getReviewStateBadgeVariant } from '../utils';

export const ReviewStateRenderer = (props) => {
  const variant = getReviewStateBadgeVariant(props.row.state);
  return (
    <StateIndicator
      variant={variant}
      label={formatReviewState(props.row.state)}
      outline
      pill
    />
  );
};
