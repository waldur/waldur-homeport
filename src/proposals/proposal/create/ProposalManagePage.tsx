import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useEffect, useMemo, useState } from 'react';
import {
  proposalProposalsRetrieve,
  proposalPublicCallsRetrieve,
  proposalReviewsList,
} from 'waldur-js-client';

import { useBreadcrumbs } from 'waldur-ui';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { goToNotFound } from '@/error/utils';
import { SidebarLayout } from '@/form/SidebarLayout';
import { translate } from '@/i18n';
import { useTitle } from '@/navigation/title';
import {
  useCallManagedProposalBreadcrumbItems,
  useParticipantProposalBreadcrumbItems,
  useProposalBreadcrumbItems,
  useProviderProposalBreadcrumbItems,
  useResultsProposalBreadcrumbItems,
} from '@/proposals/breadcrumbs';
import { usesCallVocabulary } from '@/proposals/presentation';
import { ProposalEditLockContext } from '@/proposals/team/proposalEditLock';
import {
  canEditProposal,
  canRevokeAnyProposalRole,
  canSubmitProposal,
  getGrantableProposalRoleNames,
  isOnProposalTeam,
} from '@/proposals/team/teamRules';
import { Proposal } from '@/proposals/types';
import { useCustomer, useUser } from '@/workspace/hooks';

import { getOpenChangeRequests } from '../changeRequests';
import { DownloadProposalPdfAction } from '../DownloadProposalPdfAction';
import { ProposalPreviewAction } from '../preview/ProposalPreviewAction';
import { ProposalDetails } from '../ProposalDetails';
import { ProposalRoleBasedTabs } from '../ProposalRoleBasedTabs';
import { OFFERING_TEAM_PROPOSAL_STATE, useProposalView } from '../proposalView';
import { ProposalViewNotice } from '../ProposalViewNotice';
import { WorkflowTimeline } from '../WorkflowTimeline';

import { ProposalEditLock } from './ProposalEditLock';
import { ProposalHeader } from './ProposalHeader';
import { ProposalSubmissionStep } from './ProposalSubmissionStep';
import {
  getLatestRejectedOwnReview,
  getRejectedOwnReview,
  RejectedReviewNotice,
} from './RejectedReviewNotice';

// Drawn only on the call team's view of a proposal.
const ProposalStepsGantt = lazyComponent(() =>
  import('@/proposals/workflow-description/diagram/ProposalStepsGantt').then(
    (module) => ({ default: module.ProposalStepsGantt }),
  ),
);

/**
 * Sets the applicant's breadcrumb chain.
 *
 * A component rather than a bare hook call in the page, so it can be left out
 * entirely for the call-manager view: that route hangs off `call-management`,
 * whose OrganizationUIView already publishes the organisation chain, and
 * setting an empty list from here would strip it.
 */
const ApplicantBreadcrumbs = ({ proposal }: { proposal: Proposal }) => {
  useBreadcrumbs(useProposalBreadcrumbItems(proposal));
  return null;
};

/** The chain of someone who opened it from an organisation's call results. */
const ResultsBreadcrumbs = ({
  organizationUuid,
  proposal,
}: {
  organizationUuid: string;
  proposal: Proposal;
}) => {
  const user = useUser();
  const customer = useCustomer();
  const name =
    (customer?.uuid === organizationUuid ? customer.name : undefined) ??
    user?.permissions?.find(
      (permission) => permission.customer_uuid === organizationUuid,
    )?.customer_name;
  useBreadcrumbs(
    useResultsProposalBreadcrumbItems(
      { uuid: organizationUuid, name },
      proposal,
    ),
  );
  return null;
};

/** The chain of someone working on the proposal off its team. */
const ParticipantBreadcrumbs = ({ proposal }: { proposal: Proposal }) => {
  const user = useUser();
  useBreadcrumbs(useParticipantProposalBreadcrumbItems(user, proposal));
  return null;
};

/**
 * The call team's chain, down the structure that owns the proposal rather than
 * through anyone's profile. Same component-not-hook reason as above: the two
 * are mutually exclusive, and a hook cannot be called conditionally.
 */
const CallManagerBreadcrumbs = ({
  call,
  proposal,
}: {
  call: any;
  proposal: Proposal;
}) => {
  useBreadcrumbs(useCallManagedProposalBreadcrumbItems(call, proposal));
  return null;
};

/**
 * The provider's chain, for a proposal opened from the provider's proposals.
 * Its name comes from the grant that lets the user act for it, else from the
 * organisation the provider pages left open.
 */
const ProviderBreadcrumbs = ({
  providerUuid,
  proposal,
}: {
  providerUuid: string;
  proposal: Proposal;
}) => {
  const user = useUser();
  const customer = useCustomer();
  const name =
    user?.permissions?.find(
      (permission) => permission.customer_uuid === providerUuid,
    )?.customer_name ??
    (customer?.uuid === providerUuid ? customer.name : undefined) ??
    proposal.offering_team_providers?.find((item) => item.uuid === providerUuid)
      ?.name;
  useBreadcrumbs(
    useProviderProposalBreadcrumbItems({ uuid: providerUuid, name }, proposal),
  );
  return null;
};

export const ProposalManagePage = () => {
  const {
    state,
    params: { proposal_uuid, review_uuid, provider, uuid, panels, results },
  } = useCurrentStateAndParams();
  const router = useRouter();
  // A link from before the offering team had its own view, `?provider=`,
  // opens that view.
  const legacyProvider = state.name === 'proposals.manage-proposal' && provider;
  useEffect(() => {
    if (legacyProvider) {
      router.stateService.go(
        OFFERING_TEAM_PROPOSAL_STATE,
        { uuid: legacyProvider, proposal_uuid, review_uuid, panels },
        { location: 'replace' },
      );
    }
  }, [legacyProvider, proposal_uuid, review_uuid, panels, router]);

  // A link to one review: from "My reviews", a notification, the review page.
  // Read from the route rather than getQueryParams(), which turns a bare uuid
  // into a filter's `{ uuid }` object and so never matched a review.
  const reviewUuid: string | undefined = review_uuid || undefined;

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
      }).then((response) => response.data),

    refetchOnWindowFocus: false,
    // Leaving for the "not found" page drops the uuid from the route a
    // render before the page unmounts: no request for a proposal "{uuid}".
    enabled: Boolean(proposal_uuid),
    // A reviewer whose review was rejected has lost the access it gave. The
    // page explains that itself (below) instead of the global "not found",
    // whether they came by their review's link or by the proposal's own.
    meta: reviewUuid
      ? { skipGlobalErrorRedirect: true }
      : { handlesErrorStatuses: [404] },
  });

  const isDraft = proposal?.state === 'draft';
  const title = usesCallVocabulary()
    ? isDraft
      ? translate('Update proposal')
      : translate('View proposal')
    : isDraft
      ? translate('Update access request')
      : translate('View access request');
  useTitle(title);

  const user = useUser();

  const isEditPage = state.name === 'proposals.manage-proposal';
  const { view } = useProposalView(proposal);
  const isCallManagerView = view === 'call_manager';
  const isOfferingTeamView = view === 'offering_team';
  const providerUuid: string | undefined = isOfferingTeamView
    ? uuid
    : undefined;
  // Proposal administrators edit the draft as well; submitting stays with
  // its creator, its managers and staff.
  const hasPermissionToEdit = proposal && canEditProposal(user, proposal);
  const hasPermissionToSubmit = proposal && canSubmitProposal(user, proposal);
  // Changes asked of the applicant reopen the form for the parts unlocked.
  const changesRequested = getOpenChangeRequests(proposal).length > 0;
  const formOpen =
    (proposal?.state === 'draft' || changesRequested) &&
    isEditPage &&
    hasPermissionToEdit;
  // Someone off the proposal's team who could change it -- its form, or its
  // team -- staff, say: it stays locked until they unlock editing on
  // purpose, for this visit only.
  // In their own view, the call's managers and organisers change a
  // submitted proposal's team as part of running the call: no lock there.
  // Staff hold no such grant and keep it.
  const holdsCall = Boolean(
    proposal &&
    user?.permissions?.some(
      (grant) =>
        (grant.role_name === 'CALL.MANAGER' &&
          grant.scope_uuid === proposal.call_uuid) ||
        (grant.role_name === 'CUSTOMER.CALL_ORGANIZER' &&
          grant.scope_uuid === proposal.call_managing_organisation_uuid),
    ),
  );
  const editsAsOutsider =
    Boolean(proposal) &&
    !(isCallManagerView && holdsCall) &&
    !isOnProposalTeam(user, proposal) &&
    (Boolean(formOpen) ||
      getGrantableProposalRoleNames(user, proposal).length > 0 ||
      canRevokeAnyProposalRole(user, proposal));
  const [unlockedFor, setUnlockedFor] = useState<string | null>(null);
  const editingUnlocked = !editsAsOutsider || unlockedFor === proposal?.uuid;
  const lockValue = useMemo(
    () => ({ locked: !editingUnlocked }),
    [editingUnlocked],
  );

  const { data: call } = useQuery({
    queryKey: ['ProposalCall', proposal?.call_uuid],
    queryFn: () =>
      proposalPublicCallsRetrieve({
        path: { uuid: proposal.call_uuid },
        query: {
          field: [
            'uuid',
            'name',
            'customer_uuid',
            // Both name the call-manager breadcrumb chain.
            'customer_name',
            'manager_uuid',
            'compliance_checklist',
            'compliance_checklist_name',
            // Drives which Project details fields the form asks for.
            'proposal_field_config',
            // Tells the applicant when review of a submitted proposal starts.
            'evaluation_start',
            // The lengths the applicant chooses the project's duration from.
            'allowed_duration_months',
            // Cast: compliance_checklist* are protected-call fields, so the
            // list is not assignable to keyof PublicCall.
          ] as any,
        },
      }).then((res) => res.data),
    enabled: !!proposal?.call_uuid,
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
    if (reviewUuid) {
      const review = reviews.find((rw) => rw.uuid === reviewUuid);
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
  }, [reviews, reviewUuid, user]);

  const submittedReviews = useMemo(
    () =>
      reviews
        ? reviews.filter((rw) => ['submitted', 'rejected'].includes(rw.state))
        : null,
    [reviews],
  );

  const rejectedReview = useMemo(
    () => getRejectedOwnReview(reviews, reviewUuid, user),
    [reviews, reviewUuid, user],
  );
  // Without a review's link, a proposal the viewer can no longer open is
  // explained by their own latest rejected review of it, if any.
  const lostAccessReview = useMemo(
    () =>
      (error as any)?.response?.status === 404
        ? (rejectedReview ?? getLatestRejectedOwnReview(reviews, user))
        : null,
    [error, rejectedReview, reviews, user],
  );

  // Nothing to explain: the link is as dead as any other, and says so the
  // way every other missing page does.
  const unexplainedNotFound =
    (error as any)?.response?.status === 404 &&
    !isLoadingReviews &&
    !lostAccessReview;
  useEffect(() => {
    if (unexplainedNotFound) goToNotFound();
  }, [unexplainedNotFound]);

  if (
    legacyProvider ||
    isLoading ||
    isLoadingReviews ||
    (!proposal && !error)
  ) {
    return <LoadingSpinner />;
  } else if (error) {
    // The reviewer's own reviews stay readable after the proposal does not:
    // say why the link no longer opens it rather than report a failure.
    if (lostAccessReview) {
      return (
        <RejectedReviewNotice
          review={lostAccessReview}
          hasAccess={false}
          className="mt-4"
        />
      );
    }
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <ProposalEditLockContext.Provider value={lockValue}>
      <SidebarLayout.Header className="pb-4" fluid>
        <div className="w-full">
          {isCallManagerView ? (
            <CallManagerBreadcrumbs call={call} proposal={proposal} />
          ) : providerUuid ? (
            <ProviderBreadcrumbs
              providerUuid={providerUuid}
              proposal={proposal}
            />
          ) : isOnProposalTeam(user, proposal) ? (
            <ApplicantBreadcrumbs proposal={proposal} />
          ) : results ? (
            <ResultsBreadcrumbs
              organizationUuid={results}
              proposal={proposal}
            />
          ) : (
            <ParticipantBreadcrumbs proposal={proposal} />
          )}
          {rejectedReview && (
            <RejectedReviewNotice
              review={rejectedReview}
              hasAccess
              className="mb-4"
            />
          )}
          <ProposalRoleBasedTabs
            review={userReview}
            proposal={proposal}
            call={call}
          />
          {/* The applicant preview says so itself (ProposalDetails), where
              it knows whether the viewer also works on the page. */}
          <ProposalViewNotice
            proposal={proposal}
            preview={false}
            providerUuid={providerUuid}
          />
          <ProposalHeader
            proposal={proposal}
            className="mb-5.5"
            // A utility, not a decision: beside the title, not in the sidebar.
            actions={
              isCallManagerView ? (
                <div className="flex flex-wrap gap-1.5">
                  {proposal.state !== 'draft' && (
                    <ProposalPreviewAction proposal={proposal} />
                  )}
                  <DownloadProposalPdfAction proposal={proposal} />
                </div>
              ) : undefined
            }
          />
          {editsAsOutsider && (
            <ProposalEditLock
              proposal={proposal}
              unlocked={editingUnlocked}
              formEditable={Boolean(formOpen)}
              onChange={(unlocked) =>
                setUnlockedFor(unlocked ? proposal.uuid : null)
              }
            />
          )}
          {/* No stepper while the proposal is a draft: the applicant hasn't
              submitted yet, so no workflow has started — the page shows the
              editable submission form instead. The stepper only appears from
              the submitted state onwards. */}
          {proposal.state !== 'draft' && (
            <WorkflowTimeline
              proposal={proposal}
              // The call team and an offering's team follow the real steps;
              // the applicant, and a preview of their page, the stand-ins.
              showDetails={isCallManagerView || isOfferingTeamView}
              evaluationStart={call?.evaluation_start}
            />
          )}
          {/* Planned against actual, for the call team only: the endpoint
              answers anyone else 404 and this then draws nothing. */}
          {proposal.state !== 'draft' && isCallManagerView && (
            <ProposalStepsGantt
              proposalUuid={proposal.uuid}
              // Evaluated at the round's cut-off, a submitted proposal starts
              // no step before it: its plan starts there.
              startsAt={
                call?.evaluation_start === 'at_cutoff' &&
                proposal.state === 'submitted'
                  ? proposal.round?.cutoff_time
                  : undefined
              }
            />
          )}
        </div>
      </SidebarLayout.Header>
      {formOpen && editingUnlocked ? (
        <ProposalSubmissionStep
          proposal={proposal}
          call={call}
          refetch={refetch}
          reviews={submittedReviews}
          canSubmitProposal={hasPermissionToSubmit}
        />
      ) : (
        <ProposalDetails
          proposal={proposal}
          reviews={submittedReviews}
          review={userReview}
          refetch={refetch}
        />
      )}
    </ProposalEditLockContext.Provider>
  );
};
