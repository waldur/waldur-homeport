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
import { createProposal, getProtectedCallRound } from '@waldur/proposals/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { CreatePageSidebar } from './CreatePageSidebar';
import { ProgressSteps } from './ProgressSteps';
import { createProposalSteps } from './steps/steps';

import './ProposalCreatePage.scss';

export const ProposalCreatePage = reduxForm({
  form: 'ProposalCreateForm',
  touchOnChange: true,
})((props) => {
  useFullPage();
  useTitle(translate('Create proposal'));

  const {
    params: { uuid, round_uuid },
  } = useCurrentStateAndParams();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useQuery(
    ['CallRound', uuid, round_uuid],
    () => getProtectedCallRound(uuid, round_uuid),
  );

  const formSteps = createProposalSteps;

  const stepRefs = useRef([]);
  stepRefs.current = formSteps.map(
    (_, i) => stepRefs.current[i] ?? createRef(),
  );

  const submit = useCallback(
    (formData, dispatch) => {
      Object.assign(formData, { round_uuid: data.uuid });
      return createProposal(formData)
        .then(() => {
          dispatch(showSuccess(translate('Proposal created successfully')));
          router.stateService.go('profile-proposals');
        })
        .catch((error) => {
          dispatch(showErrorResponse(error, translate('Something went wrong')));
        });
    },
    [data, router],
  );

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <>
      <ProgressSteps proposal={null} bgClass="bg-body" className="mb-10" />
      <form
        className="proposal-create-page form d-flex flex-column flex-xl-row gap-5 gap-lg-7 pb-10"
        onSubmit={props.handleSubmit(submit)}
      >
        {/* Steps */}
        <div className="proposal-create-steps container-xxl pe-xl-0 d-flex flex-column flex-lg-row-fluid gap-5 gap-lg-7">
          <Card>
            <Card.Body>
              <div className="d-flex mb-4">
                <h3 className="mb-0">Proposal #2255225 - Unknown name</h3>
                <Badge bg="light" text="dark" className="ms-4">
                  Draft
                </Badge>
              </div>
              <p className="text-muted fst-italic">UUID: {data.uuid}</p>
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
              />
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <CreatePageSidebar
          steps={formSteps}
          completedSteps={[]}
          submitting={props.submitting}
        />
      </form>
    </>
  );
});
