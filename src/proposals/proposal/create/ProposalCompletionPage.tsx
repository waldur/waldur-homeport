import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { createRef, useCallback, useRef } from 'react';
import { Badge, Card } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import {
  getProposal,
  updateProposalProjectDetails,
} from '@waldur/proposals/api';
import { formatProposalState } from '@waldur/proposals/utils';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { CompletionPageSidebar } from './CompletionPageSidebar';
import { ProgressSteps } from './ProgressSteps';
import { createProposalSteps } from './steps/steps';

import './ProposalCompletionPage.scss';

export const ProposalCompletionPage = reduxForm({
  form: 'ProposalCompletionForm',
  touchOnChange: true,
})((props) => {
  useFullPage();
  useTitle(translate('Update proposal'));

  const {
    params: { proposal_uuid },
  } = useCurrentStateAndParams();
  const router = useRouter();

  const {
    data: proposal,
    isLoading,
    error,
    refetch,
  } = useQuery(['Proposal', proposal_uuid], () => getProposal(proposal_uuid), {
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      props.initialize({
        name: data.name,
        project_summary: data.project_summary,
        project_description: data.description,
        project_has_civilian_purpose: data.project_has_civilian_purpose,
        oecd_fos_2007_code: data.oecd_fos_2007_code,
        project_is_confidential: data.project_is_confidential,
        duration_in_days: data.duration_in_days,
        supporting_documentation: data.supporting_documentation,
      });
    },
  });

  const formSteps = createProposalSteps;

  const stepRefs = useRef([]);
  stepRefs.current = formSteps.map(
    (_, i) => stepRefs.current[i] ?? createRef(),
  );

  const submit = useCallback(
    (formData, dispatch) => {
      return updateProposalProjectDetails(formData, proposal_uuid)
        .then(() => {
          dispatch(showSuccess(translate('Proposal updated successfully')));
        })
        .catch((error) => {
          dispatch(showErrorResponse(error, translate('Something went wrong')));
        });
    },
    [proposal_uuid, router],
  );

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <>
      <ProgressSteps proposal={proposal} bgClass="bg-body" className="mb-10" />
      <form
        className="form d-flex flex-column flex-xl-row gap-5 gap-lg-7 pb-10"
        onSubmit={props.handleSubmit(submit)}
      >
        {/* Steps */}
        <div className="container-xxl pe-xl-0 d-flex flex-column flex-lg-row-fluid gap-5 gap-lg-7">
          <Card>
            <Card.Body>
              <div className="d-flex mb-4">
                <h3 className="mb-0">
                  {translate('Proposal')} - {proposal.name}
                </h3>
                <Badge bg="light" text="dark" className="ms-4">
                  {formatProposalState(proposal.state)}
                </Badge>
              </div>
              <p className="text-muted fst-italic">UUID: {proposal.uuid}</p>
            </Card.Body>
          </Card>

          {formSteps.map((step, i) => (
            <div ref={stepRefs.current[i]} key={step.id}>
              <step.component
                step={i + 1}
                id={step.id}
                title={step.label}
                observed={false}
                change={props.change}
                params={{ proposal, refetch }}
              />
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <CompletionPageSidebar
          steps={formSteps}
          completedSteps={[]}
          submitting={props.submitting}
        />
      </form>
    </>
  );
});
