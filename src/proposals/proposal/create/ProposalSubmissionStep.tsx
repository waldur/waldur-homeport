import { createRef, useCallback, useRef } from 'react';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { VStepperForm } from '@waldur/form/VStepperForm';
import { translate } from '@waldur/i18n';
import {
  attachDocument,
  switchProposalToTeamVerification,
  updateProposalProjectDetails,
} from '@waldur/proposals/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { ProposalHeader } from './ProposalHeader';
import { ProposalSidebar } from './ProposalSidebar';
import { createProposalSteps } from './steps';

export const ProposalSubmissionStep = connect<{}, {}, { proposal; refetch }>(
  (_, ownProps) => ({
    initialValues: {
      name: ownProps.proposal.name,
      description: ownProps.proposal.description,
      project_summary: ownProps.proposal.project_summary,
      project_has_civilian_purpose:
        ownProps.proposal.project_has_civilian_purpose,
      oecd_fos_2007_code: ownProps.proposal.oecd_fos_2007_code,
      project_is_confidential: ownProps.proposal.project_is_confidential,
      duration_in_days: ownProps.proposal.duration_in_days,
    },
  }),
)(
  reduxForm<{}, { proposal; refetch }>({
    form: 'ProposalCompletionForm',
    touchOnChange: true,
  })(({ proposal, refetch }) => {
    const dispatch = useDispatch();
    const proposal_uuid = proposal.uuid;

    const formSteps = createProposalSteps;

    const stepRefs = useRef([]);
    stepRefs.current = formSteps.map(
      (_, i) => stepRefs.current[i] ?? createRef(),
    );

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

    return (
      <VStepperForm
        form="ProposalCompletionForm"
        steps={formSteps}
        sidebar={(sidebarProps) => (
          <ProposalSidebar
            {...sidebarProps}
            switchToTeam={switchToTeamCallback}
            canSwitchToTeam={proposal.state === 'draft'}
          />
        )}
        onSubmit={submitForm}
        noPaddingTop
      >
        <ProposalHeader proposal={proposal} />

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
      </VStepperForm>
    );
  }),
);
