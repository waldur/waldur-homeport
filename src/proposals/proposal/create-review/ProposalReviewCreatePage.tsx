import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { createRef, useCallback, useRef, useState } from 'react';
import { Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

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
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import {
  getProposal,
  getProposalReview,
  submitProposalReview,
  updateProposalReview,
} from '@waldur/proposals/api';
import { PROPOSAL_UPDATE_REVIEW_FORM_ID } from '@waldur/proposals/constants';
import { ProposalReview } from '@waldur/proposals/types';
import { formatReviewState } from '@waldur/proposals/utils';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getUser } from '@waldur/workspace/selectors';

import { CreatePageSidebar } from './CreatePageSidebar';
import { createReviewSteps } from './steps/steps';

const CommentFormDialog = lazyComponent(
  () => import('./CommentFormDialog'),
  'CommentFormDialog',
);

const loadData = async (reviewUuid) => {
  const review = await getProposalReview(reviewUuid);
  const proposal = await getProposal(getUUID(review.proposal));
  return { review, proposal };
};

export const ProposalReviewCreatePage = (props) => {
  useTitle(translate('Create review'));
  useFullPage();

  const {
    params: { review_uuid },
  } = useCurrentStateAndParams();
  const router = useRouter();
  const user = useSelector(getUser);

  // We keep the Review object here, so that we don't fetch it again every time a comment is added/edited.
  // See the "openCommentFormDialog" function.
  const [reviewObject, setReviewObject] = useState<ProposalReview>(null);

  const { data, isLoading, error, refetch } = useQuery(
    ['ReviewData', review_uuid],
    () => loadData(review_uuid),
    {
      refetchOnWindowFocus: false,
      onSuccess(data) {
        setReviewObject(data.review);
      },
    },
  );

  const formSteps = createReviewSteps;

  const stepRefs = useRef([]);
  stepRefs.current = formSteps.map(
    (_, i) => stepRefs.current[i] ?? createRef(),
  );

  const submit = useCallback(
    async (formData, dispatch) => {
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
      return submitProposalReview(formData, data.review.uuid)
        .then(() => {
          dispatch(
            showSuccess(translate('Proposal review submitted successfully')),
          );
        })
        .catch((error) => {
          dispatch(showErrorResponse(error, translate('Something went wrong')));
        });
    },
    [data, router, user],
  );

  const dispatch = useDispatch();
  const openCommentFormDialog = useCallback(
    ({ commentField, label }) =>
      dispatch(
        openModalDialog(CommentFormDialog, {
          resolve: {
            title: label,
            value: reviewObject[commentField],
            onSubmit: (formData) => {
              return updateProposalReview(
                { [commentField]: formData.comment },
                data.review.uuid,
              )
                .then((res) => {
                  setReviewObject(res.data);
                  dispatch(closeModalDialog());
                })
                .catch((error) => {
                  dispatch(
                    showErrorResponse(error, translate('Something went wrong')),
                  );
                });
            },
          },
          size: 'md',
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
    <PageBarProvider scrollTrackSide="top" scrollOffset={200}>
      <Form form={PROPOSAL_UPDATE_REVIEW_FORM_ID} onSubmit={submit}>
        <div className="container-fluid">
          <div className="my-8 border-bottom">
            <div className="hstack gap-4 mb-2">
              <h1 className="mb-0">{data.review.proposal_name}</h1>
              <Badge
                bg="grey-100"
                text="dark"
                pill
                className="badge-outline-light"
              >
                {formatReviewState(data.review.state)}
              </Badge>
            </div>
            <p className="text-grey-500 mb-8">
              {translate(
                'Please review the application below. If you want to add a comment to a specific field, click on the comment action in the corresponding field.',
              )}
            </p>
          </div>
        </div>
        <SidebarLayout.Container>
          <SidebarLayout.Body>
            {formSteps.map((step, i) => (
              <div ref={stepRefs.current[i]} key={step.id}>
                <step.component
                  id={step.id}
                  title={step.label}
                  observed={false}
                  change={props.change}
                  params={{
                    proposal: data.proposal,
                    reviews: data.review ? [data.review] : null,
                    onAddCommentClick: openCommentFormDialog,
                    readOnly: true,
                  }}
                />
              </div>
            ))}
          </SidebarLayout.Body>
          <SidebarLayout.Sidebar transparent>
            <CreatePageSidebar />
          </SidebarLayout.Sidebar>
        </SidebarLayout.Container>
      </Form>
    </PageBarProvider>
  );
};
