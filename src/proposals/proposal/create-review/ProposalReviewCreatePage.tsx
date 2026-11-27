import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Form } from 'react-final-form';
import {
  proposalProposalsRetrieve,
  proposalPublicCallsRetrieve,
  proposalReviewsPartialUpdate,
  proposalReviewsRetrieve,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SidebarLayout } from '@/form/SidebarLayout';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useTitle } from '@/navigation/title';
import {
  ArchivedCallContext,
  getArchivedCallReason,
  isCallArchived,
} from '@/proposals/archivedCall';
import { ProposalReview } from '@/proposals/types';
import { useNotify } from '@/store/notify';

import { useShowsComplianceSection } from '../create/ComplianceSummary';
import { ProposalRoleBasedTabs } from '../ProposalRoleBasedTabs';

import { ConflictOfInterestNotice } from './ConflictOfInterestNotice';
import { CreatePageSidebar } from './CreatePageSidebar';
import { ReviewHeader } from './ReviewHeader';
import { createReviewSteps } from './steps/steps';

const CommentFormDialog = lazyComponent(() =>
  import('./CommentFormDialog').then((module) => ({
    default: module.CommentFormDialog,
  })),
);

const loadData = async (reviewUuid: string) => {
  const review = await proposalReviewsRetrieve({
    path: { uuid: reviewUuid },
  }).then((response) => response.data);
  const proposal = await proposalProposalsRetrieve({
    path: { uuid: review.proposal_uuid },
  }).then((response) => response.data);
  const call = await proposalPublicCallsRetrieve({
    path: { uuid: review.call_uuid },
    // state: an archived call's reviews are read-only (isCallArchived).
    query: { field: ['uuid', 'customer_uuid', 'manager_uuid', 'state'] },
  }).then((res) => res.data);
  return { review, proposal, call };
};

export const ProposalReviewCreatePage = () => {
  useTitle(translate('Create review'));

  const {
    params: { review_uuid },
  } = useCurrentStateAndParams();

  // We keep the Review object here, so that we don't fetch it again every time a comment is added/edited.
  // See the "openCommentFormDialog" function.
  const [reviewObject, setReviewObject] = useState<ProposalReview>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ReviewData', review_uuid],
    queryFn: () => loadData(review_uuid),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data?.review) {
      setReviewObject(data.review);
    }
  }, [data]);

  const hasCompliance = useShowsComplianceSection(data?.proposal);
  const formSteps = useMemo(
    () => createReviewSteps(hasCompliance),
    [hasCompliance],
  );
  const stepRefs = useRef([]);
  stepRefs.current = formSteps.map(
    (_, i) => stepRefs.current[i] ?? createRef(),
  );

  const { showErrorResponse } = useNotify();

  const { openDialog, closeDialog } = useModal();

  const openCommentFormDialog = useCallback(
    ({ commentField, label }) =>
      openDialog(CommentFormDialog, {
        resolve: {
          title: label,
          value: reviewObject[commentField],
          onSubmit: async (formData) => {
            try {
              const res = await proposalReviewsPartialUpdate({
                path: { uuid: data.review.uuid },
                body: { [commentField]: formData.comment },
              });
              setReviewObject(res.data);
              closeDialog();
            } catch (error) {
              showErrorResponse(error, translate('Something went wrong'));
            }
          },
        },
        size: 'sm',
      }),
    [data, setReviewObject, reviewObject],
  );

  const callArchived = isCallArchived(data?.call);

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <ArchivedCallContext.Provider value={callArchived}>
      {/* The review's score/comments are written in the SubmitReviewDialog
          (opened from the sidebar), not inline. This Form only provides
          react-final-form context to the read-only step components below. */}
      <Form onSubmit={() => {}}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <SidebarLayout.Header className="pb-4">
              <div className="w-full">
                <ProposalRoleBasedTabs
                  review={data.review}
                  proposal={data.proposal}
                  call={data.call}
                />
                <ReviewHeader review={data.review} proposal={data.proposal} />
                {callArchived && (
                  <AlertItem
                    variant="info"
                    className="mt-4"
                    title={translate('This call is archived')}
                    body={getArchivedCallReason()}
                    data-testid="review-call-archived"
                  />
                )}
              </div>
            </SidebarLayout.Header>
            <SidebarLayout.Container>
              <SidebarLayout.Body>
                {/* Before the proposal body, not after it. */}
                <ConflictOfInterestNotice review={reviewObject} />
                {formSteps.map((step, i) => (
                  <div ref={stepRefs.current[i]} key={step.id}>
                    <step.component
                      id={step.id}
                      title={step.label}
                      params={{
                        proposal: data.proposal,
                        reviews: reviewObject ? [reviewObject] : [],
                        // No comments are added to a review of an archived call.
                        onAddCommentClick: callArchived
                          ? undefined
                          : openCommentFormDialog,
                        readOnly: true,
                      }}
                    />
                  </div>
                ))}
              </SidebarLayout.Body>
              <SidebarLayout.Sidebar>
                <CreatePageSidebar
                  steps={formSteps}
                  review={reviewObject}
                  proposal={data.proposal}
                  refetch={refetch}
                />
              </SidebarLayout.Sidebar>
            </SidebarLayout.Container>
          </form>
        )}
      </Form>
    </ArchivedCallContext.Provider>
  );
};
