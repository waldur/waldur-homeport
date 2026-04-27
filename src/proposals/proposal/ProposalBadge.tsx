import { Badge } from '@/core/Badge';

import { formatProposalState } from '../utils';

const stateColorMapping = {
  draft: 'default',
  submitted: 'warning',
  in_review: 'warning',
  accepted: 'primary',
  rejected: 'danger',
  canceled: 'danger',
};

export const ProposalBadge = ({ state }) => {
  const variant = stateColorMapping[state] || 'default';
  return (
    <Badge variant={variant} pill outline>
      {formatProposalState(state)}
    </Badge>
  );
};
