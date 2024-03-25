import { ReviewersSection } from '@waldur/proposals/reviewers/ReviewersSection';

import { ProjectDetailsSummary } from './ProjectDetailsSummary';
import { ProposalHeader } from './ProposalHeader';
import { ResourceRequestsSummary } from './ResourceRequestsSummary';

export const ProposalTeam = ({ proposal }) => {
  return (
    <div className="d-flex flex-column flex-xl-row gap-5 gap-lg-7 pb-10">
      <div className="container-xxl pe-xl-0 d-flex flex-column flex-lg-row-fluid gap-5 gap-lg-7">
        <ProposalHeader proposal={proposal} />
        <ProjectDetailsSummary proposal={proposal} />
        <ResourceRequestsSummary proposal={proposal} />
        <ReviewersSection scope={proposal} roleTypes={['proposal']} />
      </div>
    </div>
  );
};
