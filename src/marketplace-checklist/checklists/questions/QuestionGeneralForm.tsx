import { Field } from 'react-final-form';
import { Checklist } from 'waldur-js-client';

import { AtLeast } from '@waldur/core/types';
import { greaterThan, required } from '@waldur/core/validators';
import { NumberField, SelectField, StringField, TextField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { FormFieldError } from '@waldur/form/FormFieldError';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { ChecklistQuestionForm } from '@waldur/marketplace-checklist/types';
import { questionTypeOptions } from '@waldur/marketplace-checklist/utils';

import { QuestionAnswerOptions } from './QuestionAnswerOptions';

const gt = (value, allValues) =>
  greaterThan(Number(allValues.min_value))(Number(value));

export const QuestionGeneralForm = ({
  values,
  checklist,
}: {
  values: ChecklistQuestionForm;
  checklist?: AtLeast<Checklist, 'uuid' | 'url' | 'checklist_type'>;
}) => {
  const isOnboardingCustomer =
    checklist?.checklist_type === 'onboarding_customer';
  const isOnboardingIntent = checklist?.checklist_type === 'onboarding_intent';

  return (
    <>
      <FormGroup label={translate('Question')} required space={5}>
        <Field
          name="description"
          component={TextField as any}
          placeholder={translate('Type your question here...')}
          maxLength={150}
          validate={required}
        />
      </FormGroup>

      <FormGroup label={translate('Question type')} required space={5}>
        <Field
          name="question_type"
          component={SelectField as any}
          options={questionTypeOptions}
          validate={required}
          simpleValue
        />
      </FormGroup>

      <FormGroup space={5}>
        <Field
          name="required"
          component={AwesomeCheckboxField as any}
          label={translate('Is required?')}
        />
      </FormGroup>

      <FormGroup label={translate('Question order')} space={5}>
        <Field
          name="order"
          component={NumberField as any}
          label={translate('Question order')}
          placeholder="0"
          min={0}
        />
      </FormGroup>

      {['single_select', 'multi_select'].includes(values.question_type) ? (
        <QuestionAnswerOptions />
      ) : (
        values.question_type === 'number' && (
          <>
            <FormGroup label={translate('Min value')} space={5}>
              <Field
                name="min_value"
                component={NumberField as any}
                placeholder="0"
              />
            </FormGroup>
            <FormGroup label={translate('Max value')} space={5}>
              <Field
                name="max_value"
                component={NumberField as any}
                placeholder="0"
                validate={gt}
              />
              <FormFieldError name="max_value" />
            </FormGroup>
          </>
        )
      )}

      {isOnboardingCustomer && (
        <FormGroup
          label={translate('Customer field mapping for onboarding')}
          space={5}
          help={translate(
            "Customer model field name to map this answer to the Customer object (e.g., 'registration_code', 'email', 'vat_code').",
          )}
        >
          <Field
            name="maps_to_customer_field"
            component={StringField as any}
            placeholder="e.g., vat_code"
          />
        </FormGroup>
      )}

      {isOnboardingIntent && (
        <FormGroup
          label={translate('Intent field mapping for onboarding')}
          space={5}
          help={translate(
            "Intent/purpose field to map the answer to the verification metadata (e.g., 'intent', 'registration_purpose').",
          )}
        >
          <Field
            name="intent_field"
            component={StringField as any}
            placeholder="e.g., intent"
          />
        </FormGroup>
      )}
    </>
  );
};
