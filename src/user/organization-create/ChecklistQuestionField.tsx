import { FC } from 'react';
import { Field } from 'redux-form';
import { QuestionAdmin } from 'waldur-js-client';

import { composeValidators, required } from '@waldur/core/validators';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { DateField } from '@waldur/form/DateField';
import { FormGroup } from '@waldur/form/FormGroup';
import { NumberField } from '@waldur/form/NumberField';
import { SelectField } from '@waldur/form/SelectField';
import { StringField } from '@waldur/form/StringField';
import { TextField } from '@waldur/form/TextField';

interface ChecklistQuestionFieldProps {
  question: QuestionAdmin;
}

export const ChecklistQuestionField: FC<ChecklistQuestionFieldProps> = ({
  question,
}) => {
  const fieldName = `question_${question.uuid}`;
  const isRequired = question.required;
  const validators = isRequired ? [required] : [];

  switch (question.question_type) {
    case 'text_input':
      return (
        <Field
          key={question.uuid}
          name={fieldName}
          label={question.description}
          placeholder={question.user_guidance || ''}
          required={isRequired}
          validate={isRequired ? composeValidators(...validators) : undefined}
          component={FormGroup}
        >
          <StringField />
        </Field>
      );

    case 'text_area':
      return (
        <Field
          key={question.uuid}
          name={fieldName}
          label={question.description}
          placeholder={question.user_guidance || ''}
          rows={3}
          required={isRequired}
          validate={isRequired ? composeValidators(...validators) : undefined}
          component={FormGroup}
        >
          <TextField />
        </Field>
      );

    case 'single_select':
      return (
        <Field
          key={question.uuid}
          name={fieldName}
          label={question.description}
          required={isRequired}
          validate={isRequired ? composeValidators(...validators) : undefined}
          component={FormGroup}
          simpleValue
          options={question.question_options?.map((opt) => ({
            label: opt.label,
            value: opt.uuid,
          }))}
        >
          <SelectField />
        </Field>
      );

    case 'multi_select':
      return (
        <Field
          key={question.uuid}
          name={fieldName}
          label={question.description}
          required={isRequired}
          validate={isRequired ? composeValidators(...validators) : undefined}
          component={FormGroup}
          simpleValue
          isMulti
          options={question.question_options?.map((opt) => ({
            label: opt.label,
            value: opt.uuid,
          }))}
        >
          <SelectField />
        </Field>
      );

    case 'number':
      return (
        <Field
          key={question.uuid}
          name={fieldName}
          label={question.description}
          placeholder={question.user_guidance || ''}
          required={isRequired}
          validate={isRequired ? composeValidators(...validators) : undefined}
          component={FormGroup}
          min={question.min_value}
          max={question.max_value}
        >
          <NumberField />
        </Field>
      );

    case 'date':
      return (
        <Field
          key={question.uuid}
          name={fieldName}
          label={question.description}
          required={isRequired}
          validate={isRequired ? composeValidators(...validators) : undefined}
          component={FormGroup}
        >
          <DateField />
        </Field>
      );

    case 'boolean':
      return (
        <Field
          key={question.uuid}
          name={fieldName}
          component={AwesomeCheckboxField as any}
          label={question.description}
          description={question.user_guidance}
          validate={isRequired ? composeValidators(...validators) : undefined}
        />
      );

    default:
      return null;
  }
};
