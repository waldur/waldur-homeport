import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { createRef, useCallback, useEffect, useRef, useState } from 'react';
import { Form } from 'react-final-form';
import {
  Proposal,
  proposalProposalsRetrieve,
  proposalPublicCallsRetrieve,
  proposalReviewsPartialUpdate,
  proposalReviewsRetrieve,
  PublicCall,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SidebarLayout } from '@/form/SidebarLayout';
import { translate } from '@/i18n';
import { PageBarProvider } from '@/marketplace/context';
import { useModal } from '@/modal/actions';
import { useTitle } from '@/navigation/title';
import { ProposalReview } from '@/proposals/types';
import { useNotify } from '@/store/notify';

import { ProposalRoleBasedTabs } from '../ProposalRoleBasedTabs';

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
  const promises: [Promise<Proposal>, Promise<PublicCall>] = [
    proposalProposalsRetrieve({
      path: { uuid: review.proposal_uuid },
    }).then((response) => response.data),
    proposalPublicCallsRetrieve({
      path: { uuid: review.call_uuid },
      query: { field: ['uuid', 'customer_uuid', 'manager_uuid'] },
    }).then((res) => res.data),
  ];
  const [proposal, call] = await Promise.all(promises);
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

  const formSteps = createReviewSteps;
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

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <PageBarProvider scrollOffset={100}>
      {/* The review's score/comments are written in the SubmitReviewDialog
          (opened from the sidebar), not inline. This Form only provides
          react-final-form context to the read-only step components below. */}
      <Form onSubmit={() => {}}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <SidebarLayout.Header className="pb-5">
              <div className="w-100">
                <ProposalRoleBasedTabs
                  review={data.review}
                  proposal={data.proposal}
                  call={data.call}
                />
                <ReviewHeader review={data.review} proposal={data.proposal} />
              </div>
            </SidebarLayout.Header>
            <SidebarLayout.Container>
              <SidebarLayout.Body>
                {formSteps.map((step, i) => (
                  <div ref={stepRefs.current[i]} key={step.id}>
                    <step.component
                      id={step.id}
                      title={step.label}
                      params={{
                        proposal: data.proposal,
                        reviews: reviewObject ? [reviewObject] : [],
                        onAddCommentClick: openCommentFormDialog,
                        readOnly: true,
                      }}
                    />
                  </div>
                ))}
              </SidebarLayout.Body>
              <SidebarLayout.Sidebar transparent>
                <CreatePageSidebar review={reviewObject} refetch={refetch} />
              </SidebarLayout.Sidebar>
            </SidebarLayout.Container>
          </form>
        )}
      </Form>
    </PageBarProvider>
  );
};
