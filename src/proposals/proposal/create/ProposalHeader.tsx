import { Proposal } from '@/proposals/types';

import { EntityHeader } from '../EntityHeader';
import { ProposalBadge } from '../ProposalBadge';

interface ProposalHeaderProps {
  proposal: Proposal;
  className?: string;
}

export const ProposalHeader = ({
  proposal,
  className,
}: ProposalHeaderProps) => (
  <EntityHeader
    title={proposal.name}
    slug={proposal.slug}
    badge={<ProposalBadge state={proposal.state} />}
    className={className}
  />
);
