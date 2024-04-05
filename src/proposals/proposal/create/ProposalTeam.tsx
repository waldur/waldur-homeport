import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { TeamSection } from '@waldur/proposals/team/TeamSection';

import { ProjectDetailsSummary } from './ProjectDetailsSummary';
import { ProposalHeader } from './ProposalHeader';
import { ResourceRequestsSummary } from './ResourceRequestsSummary';

export const ProposalTeam: FC<{
  proposal;
  change(field: string, value: any): void;
}> = ({ proposal, change }) => (
  <>
    <ProposalHeader proposal={proposal} />
    <TeamSection
      scope={proposal}
      roleTypes={['proposal']}
      title={translate('Proposed project team')}
      change={change}
    />
    <ProjectDetailsSummary proposal={proposal} />
    <ResourceRequestsSummary proposal={proposal} />
  </>
);
