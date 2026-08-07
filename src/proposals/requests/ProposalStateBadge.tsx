import { FC } from 'react';

import { Badge } from '@/core/Badge';
import { ProposalState } from '@/proposals/types';
import { formatProposalState } from '@/proposals/utils';

/** Mirrors getReviewStateBadgeVariant, extended to the two states reviews lack. */
export const getProposalStateVariant = (state: ProposalState) => {
  switch (state) {
    case 'accepted':
      return 'success';
    case 'rejected':
      return 'danger';
    case 'canceled':
      return 'secondary';
    case 'draft':
      return 'secondary';
    default:
      // submitted, in_review — waiting on someone else.
      return 'warning';
  }
};

export const ProposalStateBadge: FC<{ state: ProposalState }> = ({ state }) => {
  if (!state) {
    return null;
  }
  return (
    <Badge variant={getProposalStateVariant(state)} outline>
      {formatProposalState(state)}
    </Badge>
  );
};
