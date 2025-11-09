import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Field } from 'react-final-form';
import { proposalProposalsChecklistRetrieve } from 'waldur-js-client';

import { AccordionCard } from '@waldur/core/AccordionCard';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import {
  StringField,
  TextField,
  NumberField,
  SelectField,
  FileUploadField,
} from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { DateField } from '@waldur/form/DateField';
import { VStepperFormStepProps } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { CHECKLIST_NO_CONFIGURED_MSG } from '@waldur/marketplace-checklist/constants';
import { useNotify } from '@waldur/store/hooks';

// Simple field component mapping for React Final Form
const getFieldComponent = (questionType: string) => {
  switch (questionType) {
    case 'text_input':
      return StringField;
    case 'text_area':
      return TextField;
    case 'boolean':
      return AwesomeCheckboxField;
    case 'number':
      return NumberField;
    case 'date':
      return DateField;
    case 'single_select':
      return SelectField;
    case 'multi_select':
      return SelectField;
    case 'file':
      return FileUploadField;
    default:
      return StringField;
  }
};

export const ProposalComplianceStepExpanded: FC<VStepperFormStepProps> = (
  props,
) => {
  const proposal = props.params?.proposal;
  const { showErrorResponse } = useNotify();

  if (!proposal?.uuid) {
    return (
      <AccordionCard
        id="step-compliance"
        title={translate('Compliance checklist')}
        subtitle={translate(
          'Additional questions may appear based on your answers.',
        )}
        defaultOpen={false}
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
    queryKey: ['ProposalChecklist', proposal.uuid],
    queryFn: () =>
      proposalProposalsChecklistRetrieve({ path: { uuid: proposal.uuid } })
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
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <AccordionCard
        id="step-compliance"
        title={translate('Compliance checklist')}
        subtitle={translate(
          'Additional questions may appear based on your answers.',
        )}
        defaultOpen={false}
      >
        <LoadingSpinner />
      </AccordionCard>
    );
  }

  if (error || !checklistData?.questions?.length) {
    return null; // Don't show compliance step if no questions
  }

  return (
    <AccordionCard
      id="step-compliance"
      title={translate('Compliance checklist')}
      subtitle={translate(
        'Additional questions may appear based on your answers.',
      )}
      defaultOpen={false}
    >
      {checklistData.questions.map((question) => {
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

        if (
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

        return (
          <FormGroup
            key={question.uuid}
            label={question.description}
            required={question.required}
          >
            <Field
              name={fieldName}
              component={Component as any}
              {...fieldProps}
            />
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
