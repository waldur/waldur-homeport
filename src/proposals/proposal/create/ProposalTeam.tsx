import { translate } from '@waldur/i18n';
import { TeamSection } from '@waldur/proposals/team/ReviewersSection';

import { ProjectDetailsSummary } from './ProjectDetailsSummary';
import { ProposalHeader } from './ProposalHeader';
import { ResourceRequestsSummary } from './ResourceRequestsSummary';

export const ProposalTeam = ({ proposal }) => {
  return (
    <div className="d-flex flex-column flex-xl-row gap-5 gap-lg-7 pb-10">
      <div className="container-xxl pe-xl-0 d-flex flex-column flex-lg-row-fluid gap-5 gap-lg-7">
        <ProposalHeader proposal={proposal} />
        <TeamSection
          scope={proposal}
          roleTypes={['proposal']}
          title={translate('Proposed project team')}
        />
        <ProjectDetailsSummary proposal={proposal} />
        <ResourceRequestsSummary proposal={proposal} />
      </div>
    </div>
  );
};
