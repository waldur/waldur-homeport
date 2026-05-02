import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';
import {
  proposalProposalsRetrieve,
  proposalPublicCallsRetrieve,
  proposalReviewsList,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { getQueryParams } from '@/core/filters';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SidebarLayout } from '@/form/SidebarLayout';
import { translate } from '@/i18n';
import { PageBarProvider } from '@/marketplace/context';
import { useTitle } from '@/navigation/title';
import { Proposal } from '@/proposals/types';
import { useUser } from '@/workspace/hooks';

import { ProposalDetails } from '../ProposalDetails';
import { ProposalRoleBasedTabs } from '../ProposalRoleBasedTabs';

import { ProgressSteps } from './ProgressSteps';
import { ProposalHeader } from './ProposalHeader';
import { ProposalSubmissionStep } from './ProposalSubmissionStep';

export const ProposalManagePage = () => {
  const {
    state,
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

  const user = useUser();

  const isEditPage = state.name === 'proposals.manage-proposal';
  const hasPermissionToSubmit =
    user.is_staff || (proposal && user.uuid === proposal.created_by_uuid);

  const { data: call } = useQuery({
    queryKey: ['ProposalCall', proposal?.call_uuid],
    queryFn: () =>
      proposal?.call_uuid
        ? proposalPublicCallsRetrieve({
            path: { uuid: proposal.call_uuid },
            query: {
              field: [
                'uuid',
                'customer_uuid',
                'manager_uuid',
                'compliance_checklist',
                'compliance_checklist_name',
              ] as any,
            },
          }).then((res) => res.data)
        : null,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['ProposalReviews', proposal_uuid],

    queryFn: () =>
      getAllPages((page) =>
        proposalReviewsList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            proposal_uuid,
          },
        }),
      ),

    refetchOnWindowFocus: false,
  });

  // For the "Reviewer" tab navigation, prefer using non-rejected review,
  // if all is rejected, take the newer,
  // but if another review was selected, use it by reading from the url query `review_uuid`
  const userReview = useMemo(() => {
    if (!reviews?.length) return null;
    const params = getQueryParams();
    if (params['review_uuid']) {
      const review = reviews.find((rw) => rw.uuid === params['review_uuid']);
      if (review) return review;
    }
    const userReviews = reviews.filter(
      (review) => review.reviewer_uuid === user.uuid,
    );
    if (!userReviews?.length) return null;
    if (userReviews.length === 1) return userReviews[0];
    if (userReviews.every((rw) => rw.state === 'rejected')) {
      return userReviews.sort(
        (a, b) =>
          new Date(b.review_end_date).getTime() -
          new Date(a.review_end_date).getTime(),
      )[0];
    }
    // Sort by state, so that can take prefered review
    return userReviews.sort((a, b) => (a.state < b.state ? 1 : -1))[0];
  }, [reviews, user]);

  const submittedReviews = useMemo(
    () =>
      reviews
        ? reviews.filter((rw) => ['submitted', 'rejected'].includes(rw.state))
        : null,
    [reviews],
  );

  if (isLoading || isLoadingReviews) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <PageBarProvider scrollOffset={100}>
      <SidebarLayout.Header className="pb-5">
        <div className="w-100">
          <ProposalRoleBasedTabs
            review={userReview}
            proposal={proposal}
            call={call}
          />
          <ProposalHeader proposal={proposal} className="mb-7" />
          <ProgressSteps proposal={proposal} bgClass="bg-body" />
        </div>
      </SidebarLayout.Header>
      {proposal.state === 'draft' && isEditPage && hasPermissionToSubmit ? (
        <ProposalSubmissionStep
          proposal={proposal}
          call={call}
          refetch={refetch}
          reviews={submittedReviews}
        />
      ) : (
        <ProposalDetails
          proposal={proposal}
          reviews={submittedReviews}
          refetch={refetch}
        />
      )}
    </PageBarProvider>
  );
};
