import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { createRef, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getFormValues, submit as submitForm } from 'redux-form';
import {
  proposalProposalsRetrieve,
  proposalReviewsPartialUpdate,
  proposalReviewsRetrieve,
  proposalReviewsSubmit,
} from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { getUUID } from '@waldur/core/utils';
import { Form } from '@waldur/form/Form';
import { SidebarLayout } from '@waldur/form/SidebarLayout';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { PageBarProvider } from '@waldur/marketplace/context';
import {
  closeModalDialog,
  openModalDialog,
  waitForConfirmation,
} from '@waldur/modal/actions';
import { useTitle } from '@waldur/navigation/title';
import {
  PROPOSAL_UPDATE_REVIEW_FORM_ID,
  REVIEW_SUMMARY_FORM_ID,
} from '@waldur/proposals/constants';
import { ProposalReview } from '@waldur/proposals/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';
import store from '@waldur/store/store';

import { CreatePageSidebar } from './CreatePageSidebar';
import { ReviewHeader } from './ReviewHeader';
import { createReviewSteps } from './steps/steps';

const CommentFormDialog = lazyComponent(() =>
  import('./CommentFormDialog').then((module) => ({
    default: module.CommentFormDialog,
  })),
);

const loadData = async (reviewUuid: string) => {
  const review = (await proposalReviewsRetrieve({
    path: { uuid: reviewUuid },
  }).then((response) => response.data)) as ProposalReview;
  const proposal = await proposalProposalsRetrieve({
    path: { uuid: getUUID(review.proposal) },
  }).then((response) => response.data);
  return { review, proposal };
};

export const ProposalReviewCreatePage = (props) => {
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

  const dispatch = useDispatch();

  const captureFormValues = useCallback(() => {
    store.dispatch(submitForm(REVIEW_SUMMARY_FORM_ID));
    const values = getFormValues(REVIEW_SUMMARY_FORM_ID)(
      store.getState() as RootState,
    );
    return values;
  }, []);

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSummary = useCallback(async () => {
    const values = captureFormValues();

    setIsSaving(true);
    try {
      const response = await proposalReviewsPartialUpdate({
        body: values,
        path: { uuid: data.review.uuid },
      });
      setReviewObject(response.data);
      dispatch(showSuccess(translate('Review has been updated.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to update review.')));
    } finally {
      setIsSaving(false);
    }
  }, [dispatch, data?.review]);

  const submit = useCallback(async () => {
    await handleSaveSummary();
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirm your review'),
        translate(
          'Are you sure you want to submit this review for the {name} proposal?',
          {
            name: <b>{data.proposal.name}</b>,
          },
          formatJsxTemplate,
        ),
      );
    } catch {
      return;
    }
    try {
      await proposalReviewsSubmit({
        path: { uuid: data.review.uuid },
      });
      dispatch(
        showSuccess(translate('Proposal review submitted successfully')),
      );
      refetch();
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Something went wrong')));
    }
  }, [data, dispatch]);

  const openCommentFormDialog = useCallback(
    ({ commentField, label }) =>
      dispatch(
        openModalDialog(CommentFormDialog, {
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
                dispatch(closeModalDialog());
              } catch (error) {
                dispatch(
                  showErrorResponse(error, translate('Something went wrong')),
                );
              }
            },
          },
          size: 'sm',
        }),
      ),
    [dispatch, data, setReviewObject, reviewObject],
  );

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <PageBarProvider scrollOffset={100}>
      <Form form={PROPOSAL_UPDATE_REVIEW_FORM_ID} onSubmit={submit}>
        {({ submitting }) => (
          <>
            <SidebarLayout.Header className="pb-5">
              <div className="w-100">
                <ReviewHeader review={data.review} />
              </div>
            </SidebarLayout.Header>
            <SidebarLayout.Container>
              <SidebarLayout.Body>
                {formSteps.map((step, i) => (
                  <div ref={stepRefs.current[i]} key={step.id}>
                    <step.component
                      id={step.id}
                      title={step.label}
                      change={props.change}
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
                <CreatePageSidebar
                  review={reviewObject}
                  submitting={submitting}
                  saveAsDraft={handleSaveSummary}
                  isSaving={isSaving}
                  refetch={refetch}
                />
              </SidebarLayout.Sidebar>
            </SidebarLayout.Container>
          </>
        )}
      </Form>
    </PageBarProvider>
  );
};
