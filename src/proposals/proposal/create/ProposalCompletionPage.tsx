import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { createRef, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import {
  attachDocument,
  getProposal,
  switchProposalToTeamVerification,
  updateProposalProjectDetails,
} from '@waldur/proposals/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import './ProposalCompletionPage.scss';
import { ProgressSteps } from './ProgressSteps';
import { ProposalHeader } from './ProposalHeader';
import { ProposalSidebar } from './ProposalSidebar';
import { ProposalTeam } from './ProposalTeam';
import { createProposalSteps } from './steps';

const ProposalSteps = ({ proposal, refetch }) => {
  const formSteps = createProposalSteps;

  const stepRefs = useRef([]);
  stepRefs.current = formSteps.map(
    (_, i) => stepRefs.current[i] ?? createRef(),
  );

  return (
    <>
      {formSteps.map((step, i) => (
        <div ref={stepRefs.current[i]} key={step.id}>
          <step.component
            step={i + 1}
            id={step.id}
            title={step.label}
            observed={false}
            params={{ proposal, refetch }}
          />
        </div>
      ))}
    </>
  );
};

export const ProposalCompletionPage = reduxForm({
  form: 'ProposalCompletionForm',
  touchOnChange: true,
})((props) => {
  useFullPage();
  useTitle(translate('Update proposal'));

  const {
    params: { proposal_uuid },
  } = useCurrentStateAndParams();
  const dispatch = useDispatch();

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
        description: data.description,
        project_has_civilian_purpose: data.project_has_civilian_purpose,
        oecd_fos_2007_code: data.oecd_fos_2007_code,
        project_is_confidential: data.project_is_confidential,
        duration_in_days: data.duration_in_days,
      });
    },
  });

  const submitForm = useCallback(
    async (formData) => {
      try {
        await updateProposalProjectDetails(formData, proposal_uuid);
        if (formData && formData.supporting_documentation) {
          const files = Object.values(formData.supporting_documentation);
          if (files && files.length > 0) {
            await Promise.all(
              Array.from(files).map((file) =>
                attachDocument(proposal_uuid, file),
              ),
            );
          }
        }
        dispatch(showSuccess(translate('Proposal updated successfully')));
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Something went wrong')));
      }
    },
    [proposal_uuid, dispatch],
  );

  const switchToTeamCallback = async () => {
    try {
      await switchProposalToTeamVerification(proposal_uuid);
      await refetch();
      dispatch(
        showSuccess(
          translate('Proposal has been switched to team verification step.'),
        ),
      );
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Something went wrong')));
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <>
      <ProgressSteps proposal={proposal} bgClass="bg-body" className="mb-10" />
      {proposal.state === 'team_verification' ? (
        <ProposalTeam proposal={proposal} />
      ) : (
        <form
          className="form d-flex flex-column flex-xl-row gap-5 gap-lg-7 pb-10"
          onSubmit={props.handleSubmit(submitForm)}
        >
          <div className="container-xxl pe-xl-0 d-flex flex-column flex-lg-row-fluid gap-5 gap-lg-7">
            <ProposalHeader proposal={proposal} />

            {/* Steps */}
            <ProposalSteps proposal={proposal} refetch={refetch} />
          </div>

          {/* Sidebar */}
          <ProposalSidebar
            switchToTeam={switchToTeamCallback}
            submitting={props.submitting}
            canSwitchToTeam={proposal.state === 'draft'}
          />
        </form>
      )}
    </>
  );
});
