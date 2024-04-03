import { FC, createRef, useCallback, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { Form } from '@waldur/form/Form';
import { SidebarLayout } from '@waldur/form/SidebarLayout';
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

export const ProposalSubmissionStep: FC<{ proposal; refetch }> = ({
  proposal,
  refetch,
}) => {
  const dispatch = useDispatch();
  const initialValues = useMemo(
    () => ({
      name: proposal.name,
      description: proposal.description,
      project_summary: proposal.project_summary,
      project_has_civilian_purpose: proposal.project_has_civilian_purpose,
      oecd_fos_2007_code: proposal.oecd_fos_2007_code,
      project_is_confidential: proposal.project_is_confidential,
      duration_in_days: proposal.duration_in_days,
    }),
    [proposal],
  );
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
    <Form
      form="ProposalSubmissionStep"
      onSubmit={submitForm}
      initialValues={initialValues}
    >
      <SidebarLayout.Container>
        <SidebarLayout.Body>
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
        </SidebarLayout.Body>
        <SidebarLayout.Sidebar>
          <ProposalSidebar
            steps={formSteps}
            switchToTeam={switchToTeamCallback}
            canSwitchToTeam={proposal.state === 'draft'}
          />
        </SidebarLayout.Sidebar>
      </SidebarLayout.Container>
    </Form>
  );
};