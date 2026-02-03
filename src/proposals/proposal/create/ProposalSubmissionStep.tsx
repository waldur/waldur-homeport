import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get } from 'lodash-es';
import { createRef, FC, useCallback, useEffect, useMemo, useRef } from 'react';
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
import { useAccordionUrlState } from '@waldur/core/useAccordionUrlState';
import { isEmpty } from '@waldur/core/utils';
import { SidebarLayout } from '@waldur/form/SidebarLayout';
import { translate } from '@waldur/i18n';
import { evaluateCondition } from '@waldur/marketplace-checklist/questionDependencies';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { extractComplianceAnswers } from './complianceUtils';
import { ProposalSidebar } from './ProposalSidebar';
import { createProposalSteps } from './steps';

// Check if compliance checklist is complete based on current form values
const isComplianceComplete = (
  checklistData: any,
  formValues: Record<string, any>,
): boolean => {
  if (!checklistData?.questions?.length) {
    return true; // No questions = complete
  }

  // Build map of question description to field name for dependency lookup
  const questionDescToFieldName: Record<string, string> = {};
  checklistData.questions.forEach((q: any) => {
    questionDescToFieldName[q.description] = `compliance_${q.uuid}`;
  });

  // Check if a question is visible based on its dependencies
  const isQuestionVisible = (question: any): boolean => {
    const depInfo = question.dependencies_info;
    if (!depInfo || !depInfo.conditions?.length) {
      return true; // No dependencies = always visible
    }

    const results = depInfo.conditions.map((condition: any) => {
      const fieldName = questionDescToFieldName[condition.question_description];
      const answerValue = fieldName ? formValues[fieldName] : undefined;
      return evaluateCondition(condition, answerValue);
    });

    return depInfo.logic === 'or'
      ? results.some(Boolean)
      : results.every(Boolean);
  };

  // Get visible required questions
  const visibleRequiredQuestions = checklistData.questions.filter(
    (q: any) => q.required && isQuestionVisible(q),
  );

  // Check if all visible required questions have answers
  return visibleRequiredQuestions.every((question: any) => {
    const fieldName = `compliance_${question.uuid}`;
    const value = formValues[fieldName];
    return typeof value === 'object' ? !isEmpty(value) : Boolean(value);
  });
};

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
  proposal_uuid: string,
  formData: Record<string, unknown>,
  checklistData?: {
    questions?: Array<{ uuid: string; question_type: string }>;
  },
) => {
  const complianceAnswers = extractComplianceAnswers(formData, checklistData);

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
  const queryClient = useQueryClient();
  const proposal_uuid = proposal.uuid;

  // Query the proposal checklist with all questions (including hidden ones for real-time validation)
  const { data: checklistData } = useQuery({
    queryKey: ['ProposalChecklist', proposal_uuid, 'include_all'],
    queryFn: () =>
      proposalProposalsChecklistRetrieve({
        path: { uuid: proposal_uuid },
        query: { include_all: true },
      })
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

  // Get panel IDs for accordion URL state management
  const panelIds = useMemo(() => formSteps.map((step) => step.id), [formSteps]);

  // Manage accordion open/closed state via URL query params
  const { isPanelOpen, togglePanel } = useAccordionUrlState(panelIds, []);

  const stepRefs = useRef([]);
  // Recalculate step refs when steps change (e.g., when compliance step is added)
  stepRefs.current = useMemo(() => {
    return formSteps.map((_, i) => stepRefs.current[i] ?? createRef());
  }, [formSteps]);

  // Store form reference for updating fields after save
  const formRef = useRef<any>(null);

  // Track previous checklistData to detect changes after save
  const prevChecklistDataRef = useRef(checklistData);

  // Sync compliance form fields when checklistData is refetched (e.g., after saving)
  // This ensures file uploads show as "Uploaded" instead of "Pending" after save
  useEffect(() => {
    if (!formRef.current || !checklistData?.questions) return;

    // Only sync if checklistData has actually changed
    if (prevChecklistDataRef.current === checklistData) return;
    prevChecklistDataRef.current = checklistData;

    checklistData.questions.forEach((question) => {
      const fieldName = `compliance_${question.uuid}`;
      let answerData = question.existing_answer?.answer_data || null;

      // Transform single_select arrays to single values for UI display
      if (
        question.question_type === 'single_select' &&
        Array.isArray(answerData) &&
        answerData.length > 0
      ) {
        answerData = answerData[0];
      }

      // Update the form field with the new value from backend
      const currentValue = formRef.current.getState().values[fieldName];
      // Only update if the current value has 'content' (pending upload) and
      // the new value has 'stored_file_id' (processed upload)
      if (
        currentValue &&
        typeof currentValue === 'object' &&
        'content' in currentValue &&
        answerData &&
        typeof answerData === 'object' &&
        'stored_file_id' in answerData
      ) {
        formRef.current.change(fieldName, answerData);
      }
    });
  }, [checklistData]);

  const { mutate: saveAsDraft, isPending: isSaving } = useMutation({
    mutationFn: async (formValues: any) => {
      try {
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
        // Invalidate checklist query to refresh compliance answers with stored file info
        await queryClient.invalidateQueries({
          queryKey: ['ProposalChecklist', proposal_uuid],
        });
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
    [proposal, proposal_uuid, checklistData, dispatch, refetch],
  );

  return (
    <Form
      onSubmit={submitForm}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, form, values }) => {
        // Store form reference for use in effects
        formRef.current = form;

        const completedSteps = formSteps.map((step) => {
          // Special handling for compliance step - real-time client-side validation
          if (step.id === 'step-compliance') {
            return isComplianceComplete(checklistData, values);
          }
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
                        change: form.change,
                        values,
                        isCompleted: completedSteps[i],
                        isRequired: step.required,
                        isOpen: isPanelOpen(step.id),
                        onToggle: (isOpen: boolean) =>
                          togglePanel(step.id, isOpen),
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
