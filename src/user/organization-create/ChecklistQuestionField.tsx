import { FC } from 'react';
import { Field } from 'redux-form';
import { QuestionAdmin } from 'waldur-js-client';

import { composeValidators, email, required } from '@waldur/core/validators';
import { FileUploadField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { CountrySelectField } from '@waldur/form/CountrySelectField';
import { DateField } from '@waldur/form/DateField';
import { DateTimeField } from '@waldur/form/DateTimeField';
import { EmailField } from '@waldur/form/EmailField';
import { FormGroup } from '@waldur/form/FormGroup';
import { NumberField } from '@waldur/form/NumberField';
import { PhoneNumberField } from '@waldur/form/PhoneNumberField';
import { SelectField } from '@waldur/form/SelectField';
import { StringField } from '@waldur/form/StringField';
import { TextField } from '@waldur/form/TextField';
import { YearField } from '@waldur/form/YearField';
import { translate } from '@waldur/i18n';
import { useQuestionNumberValidator } from '@waldur/marketplace-checklist/utils';

interface ChecklistQuestionFieldProps {
  question: QuestionAdmin;
}

export const ChecklistQuestionField: FC<ChecklistQuestionFieldProps> = ({
  question,
}) => {
  const fieldName = `question_${question.uuid}`;
  const type = question.question_type;
  const isRequired = question.required;

  const numberValidator = useQuestionNumberValidator(question);

  const validators = [];
  if (isRequired) validators.push(required);
  if (type === 'email') validators.push(email);
  if (type === 'number' && numberValidator) validators.push(numberValidator);

  const commonProps = {
    key: question.uuid,
    name: fieldName,
    label: question.description,
    required: isRequired,
    validate:
      validators.length > 0 ? composeValidators(...validators) : undefined,
  };

  const placeholder =
    question.user_guidance || translate('Type your answer here');

  switch (type) {
    case 'text_input':
      return (
        <Field {...commonProps} placeholder={placeholder} component={FormGroup}>
          <StringField />
        </Field>
      );

    case 'text_area':
      return (
        <Field
          {...commonProps}
          placeholder={placeholder}
          rows={3}
          component={FormGroup}
        >
          <TextField />
        </Field>
      );

    case 'single_select':
      return (
        <Field
          {...commonProps}
          component={FormGroup}
          simpleValue
          isClearable={!isRequired}
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
          {...commonProps}
          component={FormGroup}
          simpleValue
          isMulti
          isClearable={!isRequired}
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
          {...commonProps}
          placeholder="0"
          component={FormGroup}
          min={question.min_value}
          max={question.max_value}
        >
          <NumberField />
        </Field>
      );

    case 'date':
      return (
        <Field {...commonProps} component={FormGroup}>
          <DateField />
        </Field>
      );

    case 'datetime':
      return (
        <Field {...commonProps} component={FormGroup}>
          <DateTimeField />
        </Field>
      );

    case 'year':
      return (
        <Field {...commonProps} component={FormGroup}>
          <YearField />
        </Field>
      );

    case 'boolean':
      return (
        <Field
          {...commonProps}
          component={AwesomeCheckboxField as any}
          description={question.user_guidance}
        />
      );

    case 'email':
      return (
        <Field
          {...commonProps}
          placeholder={question.user_guidance}
          component={FormGroup}
        >
          <EmailField />
        </Field>
      );

    case 'phone_number':
      return (
        <Field
          {...commonProps}
          placeholder={question.user_guidance}
          component={FormGroup}
        >
          <PhoneNumberField />
        </Field>
      );

    case 'url':
      return (
        <Field
          {...commonProps}
          placeholder={question.user_guidance}
          component={FormGroup}
        >
          <StringField type="url" />
        </Field>
      );

    case 'file':
    case 'multiple_files':
      return (
        <Field
          {...commonProps}
          component={FormGroup}
          showFileName={true}
          buttonLabel={translate('Browse')}
        >
          <FileUploadField buttonLabel="" />
        </Field>
      );

    case 'rating':
      return (
        <Field
          {...commonProps}
          placeholder="0"
          component={FormGroup}
          min={question.min_value || 0}
          max={question.max_value || 10}
        >
          <NumberField />
        </Field>
      );

    case 'country':
      return (
        <Field
          {...commonProps}
          placeholder={placeholder}
          component={FormGroup}
          isClearable={!isRequired}
        >
          <CountrySelectField />
        </Field>
      );

    default:
      return (
        <Field {...commonProps} placeholder={placeholder} component={FormGroup}>
          <StringField />
        </Field>
      );
  }
};
