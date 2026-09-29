import { ReactNode } from 'react';

import { translate } from '@/i18n';
import { usesCallVocabulary } from '@/proposals/presentation';
import { Proposal } from '@/proposals/types';

import { EntityHeader } from '../EntityHeader';
import { ProposalBadge } from '../ProposalBadge';

interface ProposalHeaderProps {
  proposal: Proposal;
  className?: string;
  actions?: ReactNode;
}

export const ProposalHeader = ({
  proposal,
  className,
  actions,
}: ProposalHeaderProps) => (
  <EntityHeader
    title={proposal.name}
    slug={proposal.slug}
    badge={<ProposalBadge state={proposal.state} />}
    idLabel={usesCallVocabulary() ? undefined : translate('Request ID')}
    className={className}
    actions={actions}
  />
);
