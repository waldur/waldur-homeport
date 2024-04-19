import { get } from 'lodash';
import { createRef, FC, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { isEmpty } from '@waldur/core/utils';
import { Form } from '@waldur/form/Form';
import { SidebarLayout } from '@waldur/form/SidebarLayout';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import {
  attachDocument,
  switchProposalToTeamVerification,
  updateProposalProjectDetails,
} from '@waldur/proposals/api';
import { PROPOSAL_UPDATE_SUBMISSION_FORM_ID } from '@waldur/proposals/constants';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { ProposalHeader } from './ProposalHeader';
import { ProposalSidebar } from './ProposalSidebar';
import { createProposalSteps } from './steps';

export const formDataSelector = (state) =>
  (getFormValues(PROPOSAL_UPDATE_SUBMISSION_FORM_ID)(state) || {}) as any;

export const ProposalSubmissionStep: FC<{ proposal; reviews?; refetch }> = ({
  proposal,
  reviews,
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
      resources: [],
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
  const formData = useSelector(formDataSelector);

  const switchToTeamCallback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to send the proposal to team verification step?',
        ),
      );
    } catch {
      return;
    }
    try {
      await updateProposalProjectDetails(formData, proposal_uuid);
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

  const completedSteps = useMemo(() => {
    const result = stepRefs.current.map(() => false);
    stepRefs.current.forEach((_, i) => {
      let completed = false;
      if (formSteps[i].required && formSteps[i].requiredFields?.length) {
        completed = formSteps[i].requiredFields.every((fieldName) => {
          const field = get(formData, fieldName);
          return typeof field === 'object' ? !isEmpty(field) : Boolean(field);
        });
      } else {
        completed = true;
      }
      result[i] = completed;
    });
    return result;
  }, [formData, stepRefs.current, formSteps]);

  return (
    <Form
      form={PROPOSAL_UPDATE_SUBMISSION_FORM_ID}
      onSubmit={submitForm}
      initialValues={initialValues}
    >
      {(formProps) => (
        <SidebarLayout.Container>
          <SidebarLayout.Body>
            <ProposalHeader proposal={proposal} />

            {formSteps.map((step, i) => (
              <div ref={stepRefs.current[i]} key={step.id}>
                <step.component
                  step={i + 1}
                  id={step.id}
                  title={step.label}
                  observed={completedSteps[i]}
                  params={{
                    proposal,
                    refetch,
                    change: formProps.change,
                    reviews,
                  }}
                />
              </div>
            ))}
          </SidebarLayout.Body>
          <SidebarLayout.Sidebar>
            <ProposalSidebar
              steps={formSteps}
              switchToTeam={switchToTeamCallback}
              canSwitchToTeam={proposal.state === 'draft'}
              submitting={formProps.submitting}
              completedSteps={completedSteps}
            />
          </SidebarLayout.Sidebar>
        </SidebarLayout.Container>
      )}
    </Form>
  );
};
