import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { getAllProposalReviews, getProposal } from '@waldur/proposals/api';

import { ProposalDetails } from '../ProposalDetails';

import { ProgressSteps } from './ProgressSteps';
import { ProposalRejectionStep } from './ProposalRejectionStep';
import { ProposalSubmissionStep } from './ProposalSubmissionStep';
import { ProposalTeamVerificationStep } from './ProposalTeamVerificationStep';

export const ProposalManagePage = () => {
  useFullPage();
  useTitle(translate('Update proposal'));

  const {
    params: { proposal_uuid },
  } = useCurrentStateAndParams();

  const {
    data: proposal,
    isLoading,
    error,
    refetch,
  } = useQuery(['Proposal', proposal_uuid], () => getProposal(proposal_uuid), {
    refetchOnWindowFocus: false,
  });

  const { data: reviews, isLoading: isLoadingReviews } = useQuery(
    ['ProposalReviews', proposal_uuid],
    () => getAllProposalReviews(proposal_uuid),
    { refetchOnWindowFocus: false },
  );

  if (isLoading || isLoadingReviews) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  return !['team_verification', 'draft', 'rejected'].includes(
    proposal.state,
  ) ? (
    <ProposalDetails proposal={proposal} reviews={reviews} />
  ) : (
    <>
      <ProgressSteps
        proposal={proposal}
        bgClass="bg-body"
        className="mb-10 pt-8 pb-6"
      />
      {proposal.state === 'team_verification' ? (
        <ProposalTeamVerificationStep
          proposal={proposal}
          refetch={refetch}
          reviews={reviews}
        />
      ) : proposal.state === 'rejected' ? (
        <ProposalRejectionStep
          proposal={proposal}
          refetch={refetch}
          reviews={reviews}
        />
      ) : (
        <ProposalSubmissionStep
          proposal={proposal}
          refetch={refetch}
          reviews={reviews}
        />
      )}
    </>
  );
};
