import { Field } from 'react-final-form';

import { greaterThan, required } from '@waldur/core/validators';
import { NumberField, SelectField, TextField } from '@waldur/form';
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
}: {
  values: ChecklistQuestionForm;
}) => {
  return (
    <>
      <FormGroup label={translate('Question')} required>
        <Field
          name="description"
          component={TextField as any}
          placeholder={translate('Type your question here...')}
          maxLength={150}
          validate={required}
        />
      </FormGroup>

      <FormGroup label={translate('Question type')} required>
        <Field
          name="question_type"
          component={SelectField as any}
          options={questionTypeOptions}
          validate={required}
          simpleValue
        />
      </FormGroup>

      <Field
        name="required"
        component={AwesomeCheckboxField as any}
        label={translate('Is required?')}
      />

      {['single_select', 'multi_select'].includes(values.question_type) ? (
        <QuestionAnswerOptions />
      ) : (
        values.question_type === 'number' && (
          <>
            <FormGroup label={translate('Min value')}>
              <Field
                name="min_value"
                component={NumberField as any}
                placeholder="0"
              />
            </FormGroup>
            <FormGroup label={translate('Max value')}>
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
    </>
  );
};
