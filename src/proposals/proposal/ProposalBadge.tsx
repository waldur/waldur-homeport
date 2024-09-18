import { Badge } from '@waldur/core/Badge';

import { formatProposalState } from '../utils';

const stateColorMapping = {
  draft: 'default',
  team_verification: 'default',
  submitted: 'warning',
  in_review: 'warning',
  in_revision: 'default',
  accepted: 'primary',
  rejected: 'danger',
  canceled: 'danger',
};

export const ProposalBadge = ({ state }) => {
  const variant = stateColorMapping[state] || 'default';
  return (
    <Badge variant={variant} outline pill className="ms-4">
      {formatProposalState(state)}
    </Badge>
  );
};
