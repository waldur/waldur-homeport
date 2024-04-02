import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { TeamSection } from '@waldur/proposals/team/ReviewersSection';

import { ProjectDetailsSummary } from './ProjectDetailsSummary';
import { ProposalHeader } from './ProposalHeader';
import { ResourceRequestsSummary } from './ResourceRequestsSummary';

export const ProposalTeam: FC<{ proposal; showTeam? }> = ({ proposal }) => {
  return (
    <>
      <ProposalHeader proposal={proposal} />
      <TeamSection
        scope={proposal}
        roleTypes={['proposal']}
        title={translate('Proposed project team')}
      />
      <ProjectDetailsSummary proposal={proposal} />
      <ResourceRequestsSummary proposal={proposal} />
    </>
  );
};
