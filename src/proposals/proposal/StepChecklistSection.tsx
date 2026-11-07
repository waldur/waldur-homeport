import { useQuery } from '@tanstack/react-query';
import { FC, ReactNode, useMemo } from 'react';
import { Field, Form } from 'react-final-form';
import {
  proposalProposalsStepChecklistRetrieve,
  proposalProposalsSubmitStepChecklistAnswers,
} from 'waldur-js-client';

import { AccordionCard, FormText } from 'waldur-ui';

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

import { useConfirmApplicantChange } from './actingForApplicant';
import { ComplianceStatusBadge } from './ComplianceStatusBadge';
import { proposalContributionsKey } from './contributions/queries';
import { extractComplianceAnswers } from './create/complianceUtils';
import { QuestionDependencyHint } from './create/QuestionDependencyHint';
import { sectionOpenProps, useSectionOpenState } from './sectionOpen';

// Field-component mapping mirrors ProposalComplianceStepExpanded so a step's
// checklist renders identically to the submission compliance checklist.
const getFieldComponent = (questionType: string) => {
  switch (questionType) {
    case 'text_area':
    case 'rich_text':
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

const ChecklistFrame: FC<{
  embedded?: boolean;
  title: string;
  badge: ReactNode;
  children: ReactNode;
}> = ({ embedded, title, badge, children }) => {
  const openState = useSectionOpenState();
  return embedded ? (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-3">
        <h5 className="mb-0">{title}</h5>
        {badge}
      </div>
      {children}
    </div>
  ) : (
    <AccordionCard
      id="step-checklist"
      {...sectionOpenProps(openState, 'step-checklist', false)}
      title={title}
      subtitle={translate(
        'Questions for the current workflow step. Additional questions may appear based on answers.',
      )}
      actions={badge}
    >
      {children}
    </AccordionCard>
  );
};

/**
 * The visible questions of a checklist as form fields named
 * `compliance_<question uuid>`, read-only unless ``canEdit``: shared by a
 * step's checklist and a round report's form.
 */
export const ChecklistQuestions: FC<{
  questions: any[];
  values: Record<string, unknown> | undefined;
  canEdit: boolean;
}> = ({ questions, values, canEdit }) => {
  const fieldNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const q of questions) {
      map[q.uuid] = `compliance_${q.uuid}`;
      map[q.description] = `compliance_${q.uuid}`;
    }
    return map;
  }, [questions]);
  return (
    <>
      {questions
        .filter((question) =>
          evaluateQuestionVisibility(
            question.dependencies_info as DependencyInfo,
            fieldNames,
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
            ['single_select', 'multi_select'].includes(question.question_type)
          ) {
            fieldProps.options =
              (question.question_options as any[])?.map((opt) => ({
                value: opt.uuid,
                label: opt.label,
              })) || [];
            fieldProps.simpleValue = true;
            fieldProps.isMulti = question.question_type === 'multi_select';
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
                    <ChecklistFileUpload input={input} question={question} />
                  )}
                />
              ) : (
                <Field name={fieldName} component={Component} {...fieldProps} />
              )}
              {question.user_guidance && (
                <FormText as="div" variant="muted">
                  {question.user_guidance}
                </FormText>
              )}
            </FormGroup>
          );
        })}
    </>
  );
};

/** The form's values seeded from the answers already recorded. */
export const checklistInitialValues = (questions: any[]) => {
  const values: Record<string, unknown> = {};
  for (const q of questions) {
    const existing: any = q.existing_answer?.answer_data;
    if (existing === undefined || existing === null) continue;
    values[`compliance_${q.uuid}`] =
      q.question_type === 'single_select' && Array.isArray(existing)
        ? existing[0]
        : existing;
  }
  return values;
};

interface StepChecklistSectionProps {
  proposal: Proposal;
  /** The workflow_states row for the step whose checklist is shown. */
  step: {
    step: string;
    call_step_uuid?: string;
    checklist_status?: any;
    step_name?: string;
    kind?: string;
    completer?: string;
  };
  /** Whether the current user may answer (backend is the final authority). */
  canEdit: boolean;
  refetch?: () => void;
  /**
   * The contribution whose answers are shown and saved; the caller's own
   * contribution to the step when left out.
   */
  contributionUuid?: string;
  /** Rendered inside a contribution's card rather than as a card of its own. */
  embedded?: boolean;
}

export const stepChecklistKey = (
  proposalUuid: string,
  stepKey: string,
  contributionUuid?: string,
) =>
  ['ProposalStepChecklist', proposalUuid, stepKey, contributionUuid] as const;

type ChecklistStep = StepChecklistSectionProps['step'];

// The call step by uuid where the row carries it; its key otherwise.
const stepChecklistParams = (
  step: ChecklistStep,
  contributionUuid?: string,
) => ({
  ...(step.call_step_uuid
    ? { step_uuid: step.call_step_uuid }
    : { step: step.step }),
  ...(contributionUuid ? { contribution_uuid: contributionUuid } : {}),
});

/** The step's checklist as the section reads it; shared with the page rail. */
export const stepChecklistQuery = (
  proposalUuid: string,
  step: ChecklistStep,
  contributionUuid?: string,
) => ({
  queryKey: stepChecklistKey(
    proposalUuid,
    step.call_step_uuid ?? step.step,
    contributionUuid,
  ),
  queryFn: () =>
    proposalProposalsStepChecklistRetrieve({
      path: { uuid: proposalUuid },
      query: {
        ...stepChecklistParams(step, contributionUuid),
        include_all: 'true',
      },
    }).then((response) => response.data),
  refetchOnWindowFocus: false,
  staleTime: SHORT_STALE_TIME,
});

/**
 * Whether the checklist card is on the page: while it loads, and once it has
 * questions. A refused or empty checklist shows nothing.
 */
export const showsStepChecklist = ({
  data,
  isLoading,
  error,
}: {
  data?: { questions?: unknown[] };
  isLoading: boolean;
  error: unknown;
}) => isLoading || (!error && Boolean(data?.questions?.length));

// Renders the checklist attached to a workflow step on the proposal detail.
// The responsible role fills it while the step is active (canEdit); everyone
// else — and everyone after completion — sees it read-only. Reuses the generic
// checklist question rendering so it matches the submission compliance form.
export const StepChecklistSection: FC<StepChecklistSectionProps> = ({
  proposal,
  step,
  canEdit,
  refetch,
  contributionUuid,
  embedded,
}) => {
  const stepQuery = stepChecklistParams(step, contributionUuid);
  const checklistQuery = stepChecklistQuery(
    proposal.uuid,
    step,
    contributionUuid,
  );
  const { queryKey } = checklistQuery;
  const { data: checklistData, isLoading, error } = useQuery(checklistQuery);

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
  const initialValues = useMemo(
    () => checklistInitialValues(questions),
    [questions],
  );

  const submitAnswers = useManagedMutation<any, any, Record<string, unknown>>({
    mutationFn: (values) =>
      proposalProposalsSubmitStepChecklistAnswers({
        path: { uuid: proposal.uuid },
        query: stepQuery,
        body: extractComplianceAnswers(values, { questions }),
      }),
    successMessage: translate('Checklist answers saved.'),
    errorMessage: translate('Unable to save checklist answers.'),
    refetch,
    invalidateQueries: [
      { queryKey },
      { queryKey: proposalWorkflowStatesKey(proposal.uuid) },
      { queryKey: proposalContributionsKey(proposal.uuid) },
    ],
    // Inside a contribution's card the form sits on the page, not in a dialog.
    closeModal: !embedded,
  });

  // The answers of an applicant's step, given by someone else.
  const confirmChange = useConfirmApplicantChange(proposal);
  const applicantStep =
    step.kind === 'applicant_action' || step.completer === 'applicant';
  const submit = async (values: Record<string, unknown>) => {
    if (applicantStep) {
      const confirmed = await confirmChange(
        translate("Answer the applicant's checklist for {step}.", {
          step: step.step_name,
        }),
      );
      if (!confirmed) return;
    }
    submitAnswers.mutate(values);
  };

  if (isLoading) {
    return embedded ? (
      <LoadingSpinner />
    ) : (
      <AccordionCard id="step-checklist" title={translate('Checklist')}>
        <LoadingSpinner />
      </AccordionCard>
    );
  }
  if (!showsStepChecklist({ data: checklistData, isLoading, error })) {
    return null;
  }

  return (
    <Form onSubmit={submit} initialValues={initialValues}>
      {({ handleSubmit, values }) => (
        <form onSubmit={handleSubmit}>
          <ChecklistFrame
            embedded={embedded}
            title={
              step.checklist_status?.checklist_name || translate('Checklist')
            }
            badge={<ComplianceStatusBadge status={badgeStatus} />}
          >
            <ChecklistQuestions
              questions={questions}
              values={values}
              canEdit={canEdit}
            />
            {canEdit && (
              <div className="flex justify-end mt-3">
                <SubmitButton
                  submitting={submitAnswers.isPending}
                  label={
                    embedded
                      ? translate('Save answers')
                      : translate('Submit answers')
                  }
                />
              </div>
            )}
          </ChecklistFrame>
        </form>
      )}
    </Form>
  );
};
