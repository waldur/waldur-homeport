import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SidebarLayout } from '@waldur/form/SidebarLayout';
import { translate } from '@waldur/i18n';

import { UsersListSummary } from '../team/UsersListSummary';
import { Proposal, ProposalReview } from '../types';

import { ProgressSteps } from './create/ProgressSteps';
import { ProjectDetailsSummary } from './create/ProjectDetailsSummary';
import { ProposalHeader } from './create/ProposalHeader';
import { ResourceRequestsSummary } from './create/ResourceRequestsSummary';

interface ProposalDetails {
  proposal: Proposal;
  reviews?: ProposalReview[];
  isLoading?;
  error?;
  refetch?;
}

export const ProposalDetails = ({
  proposal,
  reviews,
  isLoading,
  error,
  refetch,
}: ProposalDetails) => {
  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <>
      <ProgressSteps
        proposal={proposal}
        bgClass="bg-body"
        className="mb-10 pt-8 pb-6"
      />
      <SidebarLayout.Body className="mb-10">
        <ProposalHeader proposal={proposal} />
        <ProjectDetailsSummary proposal={proposal} reviews={reviews} />
        <ResourceRequestsSummary proposal={proposal} reviews={reviews} />
        {!['team_verification', 'draft'].includes(proposal.state) && (
          <UsersListSummary
            scope={proposal}
            title={translate('Proposal')}
            reviews={reviews}
          />
        )}
      </SidebarLayout.Body>
    </>
  );
};
