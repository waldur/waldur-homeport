import { useMutation, useQuery } from '@tanstack/react-query';
import { get } from 'lodash-es';
import { createRef, FC, useCallback, useMemo, useRef } from 'react';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  proposalProposalsAttachDocument,
  proposalProposalsChecklistRetrieve,
  proposalProposalsSubmit,
  proposalProposalsSubmitAnswers,
  proposalProposalsUpdateProjectDetails,
  ProposalReview,
} from 'waldur-js-client';

import { formDataOptions } from '@waldur/core/api';
import { isEmpty } from '@waldur/core/utils';
import { SidebarLayout } from '@waldur/form/SidebarLayout';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { ProposalSidebar } from './ProposalSidebar';
import { createProposalSteps } from './steps';
import { useSubmitProposalResourcesFromTemplates } from './utils';

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

const submitComplianceAnswers = async (
  proposal_uuid,
  formData,
  checklistData,
) => {
  // Extract compliance answers from form data and submit them
  const complianceAnswers = [];

  Object.keys(formData).forEach((key) => {
    if (key.startsWith('compliance_')) {
      const questionUuid = key.replace('compliance_', '');
      let answerData = formData[key];

      // Format single_select answers as arrays for backend
      // Backend expects single_select as ["uuid"] not "uuid"
      if (answerData && typeof answerData === 'string') {
        // Check if this is a single_select question by finding it in checklistData
        const questionUuid = key.replace('compliance_', '');
        const isSelectQuestion = checklistData?.questions?.some(
          (q) => q.uuid === questionUuid && q.question_type === 'single_select',
        );

        if (isSelectQuestion) {
          answerData = [answerData]; // Convert "uuid" to ["uuid"] for backend
        }
      }

      complianceAnswers.push({
        question_uuid: questionUuid,
        answer_data: answerData,
      });
    }
  });

  if (complianceAnswers.length > 0) {
    try {
      await proposalProposalsSubmitAnswers({
        path: { uuid: proposal_uuid },
        body: complianceAnswers,
      });
    } catch {
      // Don't throw - compliance errors shouldn't block main proposal saving
    }
  }
};

export const ProposalSubmissionStep: FC<{
  proposal;
  call?;
  reviews?: ProposalReview[];
  refetch;
}> = ({ proposal, reviews, refetch }) => {
  const dispatch = useDispatch();
  const proposal_uuid = proposal.uuid;

  // Query the proposal checklist to see if it has questions
  const { data: checklistData } = useQuery({
    queryKey: ['ProposalChecklist', proposal_uuid],
    queryFn: () =>
      proposalProposalsChecklistRetrieve({ path: { uuid: proposal_uuid } })
        .then((response) => response.data)
        .catch((err) => {
          // If 400 with "No checklist configured", return null
          if (
            err.response?.status === 400 &&
            err.response?.data?.detail?.includes('No checklist configured')
          ) {
            return null;
          }
          throw err;
        }),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  const initialValues = useMemo(() => {
    const baseValues = {
      name: proposal.name,
      description: proposal.description,
      project_summary: proposal.project_summary,
      project_has_civilian_purpose: proposal.project_has_civilian_purpose,
      oecd_fos_2007_code: proposal.oecd_fos_2007_code,
      project_is_confidential: proposal.project_is_confidential,
      duration_in_days: proposal.duration_in_days,
      resources: [],
      resources_init: [], // Temporary field to hold current resource requests
      users: [],
    };

    // Add compliance answers to initial values if available
    if (checklistData?.questions) {
      checklistData.questions.forEach((question) => {
        const fieldName = `compliance_${question.uuid}`;
        let answerData = question.existing_answer?.answer_data || null;

        // Transform single_select arrays to single values for UI display
        if (
          question.question_type === 'single_select' &&
          Array.isArray(answerData) &&
          answerData.length > 0
        ) {
          answerData = answerData[0]; // Convert ["uuid"] to "uuid" for SelectField
        }

        baseValues[fieldName] = answerData;
      });
    }

    return baseValues;
  }, [proposal, checklistData]);

  // Only add compliance step if checklist has questions
  const shouldAddComplianceStep =
    checklistData &&
    checklistData.questions &&
    checklistData.questions.length > 0;

  // Calculate steps based on whether proposal has meaningful compliance checklist
  const formSteps = useMemo(() => {
    // Only create compliance step if checklist has questions
    const fakeCallForSteps = shouldAddComplianceStep
      ? { compliance_checklist: 'exists' }
      : undefined;
    return createProposalSteps(fakeCallForSteps);
  }, [shouldAddComplianceStep]);

  const stepRefs = useRef([]);
  // Recalculate step refs when steps change (e.g., when compliance step is added)
  stepRefs.current = useMemo(() => {
    return formSteps.map((_, i) => stepRefs.current[i] ?? createRef());
  }, [formSteps]);

  const { save: saveResources } =
    useSubmitProposalResourcesFromTemplates(proposal);

  const { mutate: saveAsDraft, isPending: isSaving } = useMutation({
    mutationFn: async (formValues: any) => {
      try {
        await saveResources();
        await proposalProposalsUpdateProjectDetails({
          path: { uuid: proposal_uuid },
          body: formValues,
        });
        await submitComplianceAnswers(proposal_uuid, formValues, checklistData);
        await attachDocuments(
          proposal_uuid,
          formValues.supporting_documentation,
        );
        dispatch(showSuccess(translate('Proposal updated successfully')));
        if (refetch) refetch();
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Something went wrong')));
      }
    },
  });

  const submitForm = useCallback(
    async (formValues: any) => {
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
        await saveResources();
        await proposalProposalsUpdateProjectDetails({
          path: { uuid: proposal_uuid },
          body: formValues,
        });
        await submitComplianceAnswers(proposal_uuid, formValues, checklistData);
        await attachDocuments(
          proposal_uuid,
          formValues.supporting_documentation,
        );
        await proposalProposalsSubmit({ path: { uuid: proposal_uuid } });
        if (refetch) refetch();
        dispatch(showSuccess(translate('Proposal submitted successfully')));
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Something went wrong')));
      }
    },
    [proposal, proposal_uuid],
  );

  return (
    <Form
      onSubmit={submitForm}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, form, values }) => {
        const completedSteps = formSteps.map((step) => {
          if (step.required && step.requiredFields?.length) {
            return step.requiredFields.every((fieldName) => {
              const field = get(values, fieldName);
              return typeof field === 'object'
                ? !isEmpty(field)
                : Boolean(field);
            });
          }
          return true;
        });

        return (
          <form onSubmit={handleSubmit}>
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
                        reviews,
                        form,
                        values,
                      }}
                    />
                  </div>
                ))}
              </SidebarLayout.Body>

              <SidebarLayout.Sidebar transparent>
                <ProposalSidebar
                  steps={formSteps}
                  saveAsDraft={() => saveAsDraft(values)}
                  isSaving={isSaving}
                  editable={proposal.state === 'draft'}
                  submitting={submitting}
                  completedSteps={completedSteps}
                />
              </SidebarLayout.Sidebar>
            </SidebarLayout.Container>
          </form>
        );
      }}
    />
  );
};
