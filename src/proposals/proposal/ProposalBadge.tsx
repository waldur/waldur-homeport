import { ProposalStates } from 'waldur-js-client';

import { Badge, BadgeVariant } from 'waldur-ui';

import { formatProposalState } from '../utils';

const stateColorMapping: Record<ProposalStates, BadgeVariant> = {
  draft: 'neutral',
  submitted: 'warning',
  in_review: 'warning',
  accepted: 'primary',
  rejected: 'danger',
  canceled: 'danger',
};

export const ProposalBadge = ({ state }: { state: ProposalStates }) => {
  const variant = stateColorMapping[state] || 'neutral';
  return (
    <Badge variant={variant} shape="pill" tone="outline">
      {formatProposalState(state)}
    </Badge>
  );
};
