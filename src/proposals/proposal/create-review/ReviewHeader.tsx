import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';
import {
  formatReviewState,
  getReviewStateBadgeVariant,
} from '@waldur/proposals/utils';

export const ReviewHeader = ({ review, className = undefined }) => {
  const variant = getReviewStateBadgeVariant(review.state);
  return (
    <div className={className}>
      <div className="d-flex align-items-center mb-1">
        <h1 className="mb-0 fs-1x">{review.proposal_name}</h1>
        <Badge variant={variant} outline pill className="ms-4">
          {formatReviewState(review.state)}
        </Badge>
      </div>
      <p className="fs-6 text-muted mb-0">
        {translate(
          'Please review the application below. If you want to add a comment to a specific field, click on the comment action in the corresponding field.',
        )}
      </p>
    </div>
  );
};
