import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { useSelector } from 'react-redux';
import {
  proposalProposalsRetrieve,
  proposalReviewsList,
} from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SidebarLayout } from '@waldur/form/SidebarLayout';
import { translate } from '@waldur/i18n';
import { PageBarProvider } from '@waldur/marketplace/context';
import { useTitle } from '@waldur/navigation/title';
import { Proposal } from '@waldur/proposals/types';
import { getUser } from '@waldur/workspace/selectors';

import { ProposalDetails } from '../ProposalDetails';

import { ProgressSteps } from './ProgressSteps';
import { ProposalHeader } from './ProposalHeader';
import { ProposalSubmissionStep } from './ProposalSubmissionStep';

export const ProposalManagePage = () => {
  const {
    params: { proposal_uuid },
  } = useCurrentStateAndParams();

  const {
    data: proposal,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['Proposal', proposal_uuid],

    queryFn: () =>
      proposalProposalsRetrieve({
        path: { uuid: proposal_uuid },
      }).then((response) => response.data as any as Proposal),

    refetchOnWindowFocus: false,
  });

  const title =
    proposal?.state === 'draft'
      ? translate('Update proposal')
      : translate('View proposal');
  useTitle(title);

  const user = useSelector(getUser);

  const hasPermissionToSubmit =
    user.is_staff || (proposal && user.uuid === proposal.created_by_uuid);

  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['ProposalReviews', proposal_uuid],

    queryFn: () =>
      getAllPages((page) =>
        proposalReviewsList({
          query: {
            page,
            proposal_uuid,
            state: ['submitted'],
          },
        }),
      ),

    refetchOnWindowFocus: false,
  });

  if (isLoading || isLoadingReviews) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <PageBarProvider scrollOffset={100}>
      <SidebarLayout.Header className="pb-5">
        <div className="w-100">
          <ProposalHeader proposal={proposal} className="mb-7" />
          <ProgressSteps proposal={proposal} bgClass="bg-body" />
        </div>
      </SidebarLayout.Header>
      {proposal.state === 'draft' && hasPermissionToSubmit ? (
        <ProposalSubmissionStep
          proposal={proposal}
          refetch={refetch}
          reviews={reviews}
        />
      ) : (
        <ProposalDetails proposal={proposal} reviews={reviews} />
      )}
    </PageBarProvider>
  );
};
