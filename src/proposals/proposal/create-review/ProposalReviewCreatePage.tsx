import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { createRef, useCallback, useRef } from 'react';
import { Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { VStepperForm } from '@waldur/form/VStepperForm';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { createProposalReview, getProposal } from '@waldur/proposals/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getUser } from '@waldur/workspace/selectors';

import { CreatePageSidebar } from './CreatePageSidebar';
import { createProposalSteps } from './steps/steps';

export const ProposalReviewCreatePage = (props) => {
  useTitle(translate('Create review'));

  const {
    params: { proposal_uuid },
  } = useCurrentStateAndParams();
  const router = useRouter();
  const user = useSelector(getUser);

  const {
    data: proposal,
    isLoading,
    error,
    refetch,
  } = useQuery(['Proposal', proposal_uuid], () => getProposal(proposal_uuid));

  const formSteps = createProposalSteps;

  const stepRefs = useRef([]);
  stepRefs.current = formSteps.map(
    (_, i) => stepRefs.current[i] ?? createRef(),
  );

  const submit = useCallback(
    (formData, dispatch) => {
      Object.assign(formData, {
        proposal: proposal.url,
        reviewer: user.url,
      });
      return createProposalReview(formData)
        .then(() => {
          dispatch(
            showSuccess(translate('Proposal review created successfully')),
          );
          router.stateService.go('protected-call.round', {
            call_uuid: proposal.call_uuid,
            round_uuid: proposal.round.uuid,
          });
        })
        .catch((error) => {
          dispatch(showErrorResponse(error, translate('Something went wrong')));
        });
    },
    [proposal, router, user],
  );

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <VStepperForm
      form="ProposalReviewCreateForm"
      steps={formSteps}
      sidebar={(sidebarProps) => (
        <CreatePageSidebar {...sidebarProps} proposal={proposal} />
      )}
      onSubmit={submit}
    >
      <Card>
        <Card.Body>
          <h6>
            {translate(
              'Welcome to the review portal. Please review the application below. If you want to add a comment to a specific field, click on the comment action in the corresponding field.',
            )}
          </h6>
        </Card.Body>
      </Card>

      {formSteps.map((step, i) => (
        <div ref={stepRefs.current[i]} key={step.id}>
          <step.component
            id={step.id}
            title={step.label}
            observed={false}
            change={props.change}
            params={{ proposal }}
          />
        </div>
      ))}
    </VStepperForm>
  );
};
