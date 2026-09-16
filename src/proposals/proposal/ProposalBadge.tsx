import { Badge } from 'waldur-ui';

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
    <Badge variant={variant} shape="pill" tone="outline">
      {formatProposalState(state)}
    </Badge>
  );
};
