import { FC, useMemo } from 'react';
import { Field } from 'react-final-form';

import { composeValidators, email, required } from '@/core/validators';
import {
  BooleanGroup,
  CountrySelectGroup,
  DateGroup,
  DateTimeGroup,
  EmailGroup,
  FileUploadGroup,
  NumberGroup,
  SelectGroup,
  StringGroup,
  TextGroup,
  YearGroup,
} from '@/form';
import { FormGroup } from '@/form/FormGroup';
import { PhoneNumberField } from '@/form/PhoneNumberField';
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
        DependencyInfo | null | undefined,
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
        <StringGroup
          {...commonProps}
          key={question.uuid}
          placeholder={placeholder}
        />
      );

    case 'text_area':
      return (
        <TextGroup
          {...commonProps}
          key={question.uuid}
          placeholder={placeholder}
          rows={3}
        />
      );

    case 'single_select':
      return (
        <SelectGroup
          {...commonProps}
          key={question.uuid}
          simpleValue
          isClearable={!isRequired}
          options={(
            question.question_options as
              Array<{ label: string; uuid: string }> | undefined
          )?.map((opt) => ({
            label: opt.label,
            value: opt.uuid,
          }))}
        />
      );

    case 'multi_select':
      return (
        <SelectGroup
          {...commonProps}
          key={question.uuid}
          simpleValue
          isMulti
          isClearable={!isRequired}
          options={(
            question.question_options as
              Array<{ label: string; uuid: string }> | undefined
          )?.map((opt) => ({
            label: opt.label,
            value: opt.uuid,
          }))}
        />
      );

    case 'number':
      return (
        <NumberGroup
          {...commonProps}
          key={question.uuid}
          placeholder="0"
          min={question.min_value}
          max={question.max_value}
        />
      );

    case 'date':
      return <DateGroup {...commonProps} key={question.uuid} />;

    case 'datetime':
      return <DateTimeGroup {...commonProps} key={question.uuid} />;

    case 'year':
      return (
        <YearGroup
          {...commonProps}
          key={question.uuid}
          placeholder={question.user_guidance}
        />
      );

    case 'boolean':
      return (
        <BooleanGroup
          {...commonProps}
          key={question.uuid}
          description={question.user_guidance}
        />
      );

    case 'email':
      return (
        <EmailGroup
          {...commonProps}
          key={question.uuid}
          placeholder={question.user_guidance}
        />
      );

    case 'phone_number':
      return (
        <Field {...commonProps} key={question.uuid}>
          {({ input, meta }) => (
            <FormGroup {...commonProps} meta={meta} controlId={input.name}>
              <PhoneNumberField
                input={input}
                meta={meta}
                placeholder={question.user_guidance}
              />
            </FormGroup>
          )}
        </Field>
      );

    case 'url':
      return (
        <StringGroup
          {...commonProps}
          key={question.uuid}
          placeholder={question.user_guidance}
          type="url"
        />
      );

    case 'file':
    case 'multiple_files':
      return (
        <FileUploadGroup
          {...commonProps}
          key={question.uuid}
          showFileName={true}
          buttonLabel={translate('Browse')}
        />
      );

    case 'rating':
      return (
        <NumberGroup
          {...commonProps}
          key={question.uuid}
          placeholder="0"
          min={question.min_value || 0}
          max={question.max_value || 10}
        />
      );

    case 'country':
      return (
        <CountrySelectGroup
          {...commonProps}
          key={question.uuid}
          placeholder={placeholder}
          isClearable={!isRequired}
        />
      );

    default:
      return (
        <StringGroup
          {...commonProps}
          key={question.uuid}
          placeholder={placeholder}
        />
      );
  }
};
