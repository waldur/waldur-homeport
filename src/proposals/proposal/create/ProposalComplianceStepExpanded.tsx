import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import { Field } from 'react-final-form';
import { proposalProposalsChecklistRetrieve } from 'waldur-js-client';

import { AccordionCard } from '@/core/AccordionCard';
import { SHORT_STALE_TIME } from '@/core/constants';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { isEmpty } from '@/core/utils';
import { StringField, TextField, NumberField, SelectField } from '@/form';
import { FormGroup } from '@/form';
import { DateField } from '@/form/DateField';
import { translate } from '@/i18n';
import { ChecklistFileUpload } from '@/marketplace-checklist/ChecklistFileUpload';
import { CHECKLIST_NO_CONFIGURED_MSG } from '@/marketplace-checklist/constants';
import {
  DependencyInfo,
  evaluateQuestionVisibility,
} from '@/marketplace-checklist/questionDependencies';
import { useNotify } from '@/store/notify';
import { VStepperFormStepProps } from '@/wizard';

import { QuestionDependencyHint } from './QuestionDependencyHint';
import { StepHeaderContent } from './StepHeaderContent';

// Simple field component mapping for React Final Form
const getFieldComponent = (questionType: string) => {
  switch (questionType) {
    case 'text_input':
      return StringField;
    case 'text_area':
      return TextField;
    case 'boolean':
      return SelectField; // Use dropdown for clear Yes/No/Unanswered states
    case 'number':
      return NumberField;
    case 'date':
      return DateField;
    case 'single_select':
      return SelectField;
    case 'multi_select':
      return SelectField;
    case 'file':
    case 'multiple_files':
      return null; // Handled separately with custom render
    default:
      return StringField;
  }
};

// Yes/No options for boolean questions
const BOOLEAN_OPTIONS = [
  { value: true, label: translate('Yes') },
  { value: false, label: translate('No') },
];

export const ProposalComplianceStepExpanded: FC<VStepperFormStepProps> = (
  props,
) => {
  const proposal = props.params?.proposal;
  const values = props.params?.values;
  const isCompleted = props.params?.isCompleted;
  const isRequired = props.params?.isRequired;
  const isOpen = props.params?.isOpen;
  const onToggle = props.params?.onToggle;
  const { showErrorResponse } = useNotify();

  if (!proposal?.uuid) {
    return (
      <AccordionCard
        id="step-compliance"
        title={translate('Compliance checklist')}
        subtitle={translate(
          'Additional questions may appear based on your answers.',
        )}
        isOpen={isOpen}
        onToggle={onToggle}
        actions={
          <StepHeaderContent
            isCompleted={isCompleted}
            isRequired={isRequired}
          />
        }
      >
        <div className="text-center text-muted p-4">
          {translate('Proposal not available.')}
        </div>
      </AccordionCard>
    );
  }

  const {
    data: checklistData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['ProposalChecklist', proposal.uuid, 'include_all'],
    queryFn: () =>
      proposalProposalsChecklistRetrieve({
        path: { uuid: proposal.uuid },
        query: { include_all: true }, // Get all questions for dynamic visibility
      })
        .then((response) => response.data)
        .catch((err) => {
          if (
            err.response?.status === 400 &&
            err.response?.data?.detail === CHECKLIST_NO_CONFIGURED_MSG
          ) {
            return null;
          }
          showErrorResponse(
            err,
            translate('Unable to load compliance checklist.'),
          );
          throw err;
        }),
    refetchOnWindowFocus: false,
    staleTime: SHORT_STALE_TIME,
  });

  // Build a map of question UUID to form field name for dependency lookup
  const questionUuidToFieldName = useMemo(() => {
    if (!checklistData?.questions) return {};
    return checklistData.questions.reduce(
      (acc, q) => {
        acc[q.uuid] = `compliance_${q.uuid}`;
        // Also map by description for dependency matching
        acc[q.description] = `compliance_${q.uuid}`;
        return acc;
      },
      {} as Record<string, string>,
    );
  }, [checklistData]);

  // Check if a question is visible based on its dependencies and current form values
  const isQuestionVisible = useCallback(
    (question: (typeof checklistData.questions)[0]): boolean => {
      return evaluateQuestionVisibility(
        question.dependencies_info as DependencyInfo,
        questionUuidToFieldName,
        values || {},
      );
    },
    [questionUuidToFieldName, values],
  );

  // Filter to visible questions
  const visibleQuestions = useMemo(() => {
    if (!checklistData?.questions) return [];
    return checklistData.questions.filter(isQuestionVisible);
  }, [checklistData, isQuestionVisible]);

  // Count answered questions for metadata display (only count visible ones)
  const { answeredCount, totalCount } = useMemo(() => {
    if (!visibleQuestions.length || !values) {
      return { answeredCount: 0, totalCount: 0 };
    }
    const total = visibleQuestions.length;
    const answered = visibleQuestions.filter((question) => {
      const fieldName = `compliance_${question.uuid}`;
      const value = values[fieldName];
      return typeof value === 'object' ? !isEmpty(value) : Boolean(value);
    }).length;
    return { answeredCount: answered, totalCount: total };
  }, [visibleQuestions, values]);

  if (isLoading) {
    return (
      <AccordionCard
        id="step-compliance"
        title={translate('Compliance checklist')}
        subtitle={translate(
          'Additional questions may appear based on your answers.',
        )}
        isOpen={isOpen}
        onToggle={onToggle}
        actions={
          <StepHeaderContent
            isCompleted={isCompleted}
            isRequired={isRequired}
          />
        }
      >
        <LoadingSpinner />
      </AccordionCard>
    );
  }

  if (error || !checklistData?.questions?.length) {
    return null; // Don't show compliance step if no questions configured
  }

  return (
    <AccordionCard
      id="step-compliance"
      title={translate('Compliance checklist')}
      subtitle={translate(
        'Additional questions may appear based on your answers.',
      )}
      isOpen={isOpen}
      onToggle={onToggle}
      actions={
        <StepHeaderContent
          isCompleted={isCompleted}
          isRequired={isRequired}
          metadata={
            totalCount > 0
              ? translate('{answered}/{total} answered', {
                  answered: answeredCount,
                  total: totalCount,
                })
              : undefined
          }
        />
      }
    >
      {visibleQuestions.map((question) => {
        const fieldName = `compliance_${question.uuid}`;
        const Component = getFieldComponent(question.question_type);

        // Get field-specific props
        const fieldProps: any = {
          placeholder: ['text_input', 'text_area'].includes(
            question.question_type,
          )
            ? translate('Enter your answer...')
            : undefined,
        };

        if (question.question_type === 'boolean') {
          fieldProps.options = BOOLEAN_OPTIONS;
          fieldProps.simpleValue = true;
          fieldProps.isClearable = true;
        } else if (
          ['single_select', 'multi_select'].includes(question.question_type)
        ) {
          fieldProps.options =
            question.question_options?.map((opt) => ({
              value: opt.uuid,
              label: opt.label,
            })) || [];
          fieldProps.simpleValue = true;
          fieldProps.isMulti = question.question_type === 'multi_select';
          fieldProps.isClearable = !question.required;
        }

        // Check if this is a file upload question
        const isFileQuestion = ['file', 'multiple_files'].includes(
          question.question_type,
        );

        return (
          <FormGroup
            key={question.uuid}
            label={question.description}
            required={question.required}
          >
            {question.dependencies_info && (
              <QuestionDependencyHint
                dependencyInfo={question.dependencies_info}
              />
            )}
            {isFileQuestion ? (
              <Field
                name={fieldName}
                render={({ input, meta }) => (
                  <ChecklistFileUpload
                    input={input}
                    meta={meta}
                    question={question}
                  />
                )}
              />
            ) : (
              <Field name={fieldName} component={Component} {...fieldProps} />
            )}
            {question.user_guidance && (
              <div className="form-text text-muted">
                {question.user_guidance}
              </div>
            )}
          </FormGroup>
        );
      })}
    </AccordionCard>
  );
};
