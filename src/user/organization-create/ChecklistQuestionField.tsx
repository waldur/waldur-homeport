import { FC, useMemo } from 'react';
import { Field } from 'redux-form';

import { composeValidators, email, required } from '@/core/validators';
import { FileUploadField } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { CountrySelectField } from '@/form/CountrySelectField';
import { DateField } from '@/form/DateField';
import { DateTimeField } from '@/form/DateTimeField';
import { EmailField } from '@/form/EmailField';
import { FormGroup } from '@/form/FormGroup';
import { NumberField } from '@/form/NumberField';
import { PhoneNumberField } from '@/form/PhoneNumberField';
import { SelectField } from '@/form/SelectField';
import { StringField } from '@/form/StringField';
import { TextField } from '@/form/TextField';
import { YearField } from '@/form/YearField';
import { translate } from '@/i18n';
import {
  DependencyInfo,
  evaluateQuestionVisibility,
} from '@/marketplace-checklist/questionDependencies';
import { useQuestionNumberValidator } from '@/marketplace-checklist/utils';

import { QuestionWithMetadata } from './utils';

interface ChecklistQuestionFieldProps {
  question: QuestionWithMetadata;
  allQuestions?: QuestionWithMetadata[];
  formValues?: Record<string, any>;
}

export const ChecklistQuestionField: FC<ChecklistQuestionFieldProps> = ({
  question,
  allQuestions,
  formValues,
}) => {
  const fieldName = `question_${question.uuid}`;
  const type = question.question_type;
  const isRequired = question.required;

  const numberValidator = useQuestionNumberValidator(question);

  const isVisible = useMemo(() => {
    if (!allQuestions || !formValues) {
      return true;
    }

    // Build a map of question description to form field name for dependency lookup
    const questionDescToFieldName = allQuestions.reduce(
      (acc, q) => {
        acc[q.description] = `question_${q.uuid}`;
        return acc;
      },
      {} as Record<string, string>,
    );

    return evaluateQuestionVisibility(
      question.dependencies_info as unknown as
        | DependencyInfo
        | null
        | undefined,
      questionDescToFieldName,
      formValues,
    );
  }, [question.dependencies_info, allQuestions, formValues]);

  if (!isVisible) {
    return null;
  }

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
          options={(
            question.question_options as
              | Array<{ label: string; uuid: string }>
              | undefined
          )?.map((opt) => ({
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
          options={(
            question.question_options as
              | Array<{ label: string; uuid: string }>
              | undefined
          )?.map((opt) => ({
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
