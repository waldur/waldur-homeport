import { useMutation } from '@tanstack/react-query';
import { get } from 'lodash-es';
import { createRef, FC, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { change, getFormValues } from 'redux-form';
import {
  proposalProposalsAttachDocument,
  proposalProposalsSubmit,
  proposalProposalsUpdateProjectDetails,
  ProposalReview,
} from 'waldur-js-client';

import { formDataOptions } from '@waldur/core/api';
import { isEmpty } from '@waldur/core/utils';
import { Form } from '@waldur/form/Form';
import { SidebarLayout } from '@waldur/form/SidebarLayout';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { PROPOSAL_UPDATE_SUBMISSION_FORM_ID } from '@waldur/proposals/constants';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { ProposalSidebar } from './ProposalSidebar';
import { createProposalSteps } from './steps';

const formDataSelector = (state) =>
  (getFormValues(PROPOSAL_UPDATE_SUBMISSION_FORM_ID)(state) || {}) as any;

const attachDocuments = async (proposal_uuid, supporting_documentation) => {
  if (supporting_documentation) {
    const files: File[] = Object.values(supporting_documentation);
    if (files && files.length > 0) {
      await Promise.all(
        Array.from(files).map((file) =>
          proposalProposalsAttachDocument({
            path: { uuid: proposal_uuid },
            body: { file },
            ...formDataOptions,
          }),
        ),
      );
    }
  }
};

const validate = (values) => {
  const errors: Record<string, any> = {};
  if (!values.users || values.users?.length === 0) {
    errors.users = 'At least one user is required';
  }
  if (!values.resources || values.resources?.length === 0) {
    errors.resources = 'At least one resource is required';
  }
  return errors;
};

export const ProposalSubmissionStep: FC<{
  proposal;
  reviews?: ProposalReview[];
  refetch;
}> = ({ proposal, reviews, refetch }) => {
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
      users: [],
    }),
    [proposal],
  );
  const proposal_uuid = proposal.uuid;

  const formSteps = createProposalSteps;

  const stepRefs = useRef([]);
  stepRefs.current = formSteps.map(
    (_, i) => stepRefs.current[i] ?? createRef(),
  );

  const formData = useSelector(formDataSelector);

  const { mutate: saveAsDraft, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      try {
        await proposalProposalsUpdateProjectDetails({
          path: { uuid: proposal_uuid },
          body: formData,
        });
        await attachDocuments(proposal_uuid, formData.supporting_documentation);
        dispatch(showSuccess(translate('Proposal updated successfully')));
        // clear formData.supporting_documentation from redux-form store to prevent file upload on next submit/switchToTeam
        dispatch(
          change(
            PROPOSAL_UPDATE_SUBMISSION_FORM_ID,
            'supporting_documentation',
            {},
          ),
        );
        refetch && refetch();
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Something went wrong')));
      }
    },
  });

  const submitForm = useCallback(
    async (formValues, dispatch) => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Confirmation'),
          translate('Are you sure you want to submit the proposal?'),
        );
      } catch {
        return;
      }
      try {
        await proposalProposalsUpdateProjectDetails({
          path: { uuid: proposal_uuid },
          body: formValues,
        });
        await attachDocuments(
          proposal_uuid,
          formValues.supporting_documentation,
        );
        await proposalProposalsSubmit({ path: { uuid: proposal_uuid } });
        refetch && refetch();
        dispatch(showSuccess(translate('Proposal submitted successfully')));
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Something went wrong')));
      }
    },
    [proposal, proposal_uuid],
  );

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
      validate={validate}
    >
      {(formProps) => (
        <SidebarLayout.Container>
          <SidebarLayout.Body>
            {formSteps.map((step, i) => (
              <div ref={stepRefs.current[i]} key={step.id}>
                <step.component
                  id={step.id}
                  title={step.label}
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

          <SidebarLayout.Sidebar transparent>
            <ProposalSidebar
              steps={formSteps}
              saveAsDraft={saveAsDraft}
              isSaving={isSaving}
              editable={proposal.state === 'draft'}
              submitting={formProps.submitting}
              completedSteps={completedSteps}
            />
          </SidebarLayout.Sidebar>
        </SidebarLayout.Container>
      )}
    </Form>
  );
};
