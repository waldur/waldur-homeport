import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';
import { Proposal, ProposalReview } from '@waldur/proposals/types';
import {
  formatReviewState,
  getReviewStateBadgeVariant,
  isReviewInFinalState,
} from '@waldur/proposals/utils';

import { EntityHeader } from '../EntityHeader';

interface ReviewHeaderProps {
  review: ProposalReview;
  proposal: Proposal;
  className?: string;
}

export const ReviewHeader = ({
  review,
  proposal,
  className,
}: ReviewHeaderProps) => {
  const variant = getReviewStateBadgeVariant(review.state);
  const disabled = isReviewInFinalState(review.state);

  const helpText = !disabled
    ? translate(
        'Please review the application below. If you want to add a comment to a specific field, click on the comment action in the corresponding field.',
      )
    : undefined;

  return (
    <EntityHeader
      title={proposal.name}
      slug={proposal.slug}
      badge={
        <Badge variant={variant} pill outline>
          {formatReviewState(review.state)}
        </Badge>
      }
      helpText={helpText}
      className={className}
    />
  );
};
