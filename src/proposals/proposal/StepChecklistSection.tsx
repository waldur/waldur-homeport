import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Field, Form } from 'react-final-form';
import {
  proposalProposalsStepChecklistRetrieve,
  proposalProposalsSubmitStepChecklistAnswers,
} from 'waldur-js-client';

import { AccordionCard } from '@/core/AccordionCard';
import { SHORT_STALE_TIME } from '@/core/constants';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import {
  FormGroup,
  NumberField,
  SelectField,
  StringField,
  SubmitButton,
  TextField,
} from '@/form';
import { DateField } from '@/form/DateField';
import { translate } from '@/i18n';
import { ChecklistFileUpload } from '@/marketplace-checklist/ChecklistFileUpload';
import {
  DependencyInfo,
  evaluateQuestionVisibility,
} from '@/marketplace-checklist/questionDependencies';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Proposal } from '@/proposals/types';
import { proposalWorkflowStatesKey } from '@/proposals/workflow/queries';

import { ComplianceStatusBadge } from './ComplianceStatusBadge';
import { extractComplianceAnswers } from './create/complianceUtils';
import { QuestionDependencyHint } from './create/QuestionDependencyHint';

// Field-component mapping mirrors ProposalComplianceStepExpanded so a step's
// checklist renders identically to the submission compliance checklist.
const getFieldComponent = (questionType: string) => {
  switch (questionType) {
    case 'text_area':
      return TextField;
    case 'boolean':
    case 'single_select':
    case 'multi_select':
      return SelectField;
    case 'number':
      return NumberField;
    case 'date':
      return DateField;
    default:
      return StringField;
  }
};

const BOOLEAN_OPTIONS = [
  { value: true, label: translate('Yes') },
  { value: false, label: translate('No') },
];

interface StepChecklistSectionProps {
  proposal: Proposal;
  /** The workflow_states row for the step whose checklist is shown. */
  step: { step: string; checklist_status?: any };
  /** Whether the current user may answer (backend is the final authority). */
  canEdit: boolean;
  refetch?: () => void;
}

// Renders the checklist attached to a workflow step on the proposal detail.
// The responsible role fills it while the step is active (canEdit); everyone
// else — and everyone after completion — sees it read-only. Reuses the generic
// checklist question rendering so it matches the submission compliance form.
export const StepChecklistSection: FC<StepChecklistSectionProps> = ({
  proposal,
  step,
  canEdit,
  refetch,
}) => {
  const stepKey = step.step;
  const {
    data: checklistData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['ProposalStepChecklist', proposal.uuid, stepKey],
    queryFn: () =>
      proposalProposalsStepChecklistRetrieve({
        path: { uuid: proposal.uuid },
        query: { step: stepKey, include_all: 'true' },
      }).then((response) => response.data),
    refetchOnWindowFocus: false,
    staleTime: SHORT_STALE_TIME,
  });

  const questions = checklistData?.questions ?? [];

  // Badge reads live completion data from the fetched checklist (is_completed /
  // completion_percentage). The workflow_states `checklist_status` uses
  // different field names (checklist_completed / unanswered_required_count), so
  // feeding it straight to ComplianceStatusBadge left it stuck at "0% complete".
  const badgeStatus = useMemo(() => {
    if (checklistData?.completion) {
      return {
        has_checklist: true,
        is_completed: checklistData.completion.is_completed,
        completion_percentage: checklistData.completion.completion_percentage,
      };
    }
    if (step.checklist_status?.has_checklist) {
      return {
        has_checklist: true,
        is_completed: false,
        completion_percentage: 0,
      };
    }
    return null;
  }, [checklistData, step.checklist_status]);

  // Seed the form from any answers already recorded for this step's checklist.
  const initialValues = useMemo(() => {
    const values: Record<string, unknown> = {};
    for (const q of questions) {
      const existing: any = (q as any).existing_answer?.answer_data;
      if (existing === undefined || existing === null) continue;
      values[`compliance_${q.uuid}`] =
        q.question_type === 'single_select' && Array.isArray(existing)
          ? existing[0]
          : existing;
    }
    return values;
  }, [questions]);

  const questionUuidToFieldName = useMemo(() => {
    const map: Record<string, string> = {};
    for (const q of questions) {
      map[q.uuid] = `compliance_${q.uuid}`;
      map[q.description] = `compliance_${q.uuid}`;
    }
    return map;
  }, [questions]);

  const submitAnswers = useManagedMutation<any, any, Record<string, unknown>>({
    mutationFn: (values) =>
      proposalProposalsSubmitStepChecklistAnswers({
        path: { uuid: proposal.uuid },
        query: { step: stepKey },
        body: extractComplianceAnswers(values, { questions }),
      }),
    successMessage: translate('Checklist answers saved.'),
    errorMessage: translate('Unable to save checklist answers.'),
    refetch,
    invalidateQueries: [
      { queryKey: ['ProposalStepChecklist', proposal.uuid, stepKey] },
      { queryKey: proposalWorkflowStatesKey(proposal.uuid) },
    ],
  });

  if (isLoading) {
    return (
      <AccordionCard id="step-checklist" title={translate('Checklist')}>
        <LoadingSpinner />
      </AccordionCard>
    );
  }
  if (error || !questions.length) {
    return null;
  }

  return (
    <Form
      onSubmit={(values) => submitAnswers.mutate(values)}
      initialValues={initialValues}
    >
      {({ handleSubmit, values }) => (
        <form onSubmit={handleSubmit}>
          <AccordionCard
            id="step-checklist"
            title={
              step.checklist_status?.checklist_name || translate('Checklist')
            }
            subtitle={translate(
              'Questions for the current workflow step. Additional questions may appear based on answers.',
            )}
            actions={<ComplianceStatusBadge status={badgeStatus} />}
          >
            {questions
              .filter((question) =>
                evaluateQuestionVisibility(
                  question.dependencies_info as DependencyInfo,
                  questionUuidToFieldName,
                  values || {},
                ),
              )
              .map((question) => {
                const fieldName = `compliance_${question.uuid}`;
                const Component = getFieldComponent(question.question_type);
                const isFileQuestion = ['file', 'multiple_files'].includes(
                  question.question_type,
                );
                const fieldProps: any = { disabled: !canEdit };
                if (question.question_type === 'boolean') {
                  fieldProps.options = BOOLEAN_OPTIONS;
                  fieldProps.simpleValue = true;
                  fieldProps.isClearable = true;
                } else if (
                  ['single_select', 'multi_select'].includes(
                    question.question_type,
                  )
                ) {
                  fieldProps.options =
                    (question.question_options as any[])?.map((opt) => ({
                      value: opt.uuid,
                      label: opt.label,
                    })) || [];
                  fieldProps.simpleValue = true;
                  fieldProps.isMulti =
                    question.question_type === 'multi_select';
                  fieldProps.isClearable = !question.required;
                }
                return (
                  <FormGroup
                    key={question.uuid}
                    label={question.description}
                    required={question.required}
                  >
                    {question.dependencies_info && (
                      <QuestionDependencyHint
                        dependencyInfo={question.dependencies_info as any}
                      />
                    )}
                    {isFileQuestion ? (
                      <Field
                        name={fieldName}
                        render={({ input }) => (
                          <ChecklistFileUpload
                            input={input}
                            question={question}
                          />
                        )}
                      />
                    ) : (
                      <Field
                        name={fieldName}
                        component={Component}
                        {...fieldProps}
                      />
                    )}
                    {question.user_guidance && (
                      <div className="form-text text-muted">
                        {question.user_guidance}
                      </div>
                    )}
                  </FormGroup>
                );
              })}
            {canEdit && (
              <div className="d-flex justify-content-end mt-4">
                <SubmitButton
                  submitting={submitAnswers.isPending}
                  label={translate('Submit answers')}
                />
              </div>
            )}
          </AccordionCard>
        </form>
      )}
    </Form>
  );
};
