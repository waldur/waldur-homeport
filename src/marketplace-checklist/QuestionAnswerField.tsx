import { ComponentType } from 'react';
import { Field } from 'react-final-form';
import { QuestionAdmin, QuestionTypeEnum } from 'waldur-js-client';

import { composeValidators, required } from '@/core/validators';
import {
  FileUploadField,
  NumberField,
  SelectField,
  StringField,
  TextField,
} from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { CountrySelectField } from '@/form/CountrySelectField';
import { DateField } from '@/form/DateField';
import { DateTimeField } from '@/form/DateTimeField';
import { EmailField } from '@/form/EmailField';
import MarkdownEditor from '@/form/MarkdownEditor';
import { PhoneNumberField } from '@/form/PhoneNumberField';
import { YearField } from '@/form/YearField';
import { translate } from '@/i18n';
import { ChecklistFileUpload } from '@/marketplace-checklist/ChecklistFileUpload';
import { LikertField } from '@/marketplace-checklist/LikertField';
import {
  isQuestionFileType,
  isQuestionLikertType,
  isQuestionSelectType,
  useQuestionNumberValidator,
} from '@/marketplace-checklist/utils';

const questionComponent: Record<QuestionTypeEnum, ComponentType> = {
  text_input: StringField,
  text_area: TextField,
  boolean: AwesomeCheckboxField,
  number: NumberField,
  date: DateField,
  datetime: DateTimeField,
  single_select: SelectField,
  multi_select: SelectField,
  multiple_files: FileUploadField,
  file: FileUploadField,
  url: StringField,
  email: EmailField,
  country: CountrySelectField,
  phone_number: PhoneNumberField,
  year: YearField,
  rating: NumberField,
  likert: LikertField as ComponentType,
  rich_text: MarkdownEditor as ComponentType,
};

type OwnProps = {
  question: QuestionAdmin;
  name: string;
} & Record<string, any>;

export const QuestionAnswerField = ({ question, name, ...props }: OwnProps) => {
  const type = question.question_type;
  const isSelectType = isQuestionSelectType(type);
  const numberValidator = useQuestionNumberValidator(question);

  const validators = [];
  if (question.required) validators.push(required);
  if (type === 'number' && numberValidator) validators.push(numberValidator);
  const validate =
    validators.length > 0 ? composeValidators(...validators) : undefined;

  // File uploads need base64 conversion and multiple-file handling, so they use
  // a dedicated component rather than the generic field map.
  if (isQuestionFileType(type)) {
    return (
      <Field
        name={name}
        validate={question.required ? required : undefined}
        render={({ input }) => (
          <ChecklistFileUpload
            input={input}
            question={question}
            onRejectionChange={props.onRejectionChange}
          />
        )}
      />
    );
  }

  return (
    <Field
      name={name}
      placeholder={
        ['text_input', 'text_area'].includes(type)
          ? translate('Answer')
          : type === 'number'
            ? '0'
            : undefined
      }
      component={(questionComponent[type] || StringField) as any}
      {...(isSelectType
        ? {
            options: question.question_options,
            getOptionValue: (opt) => opt.uuid,
            simpleValue: true,
            isMulti: type === 'multi_select',
            isClearable: !question.required,
          }
        : {})}
      {...(isQuestionLikertType(type) ? { question } : {})}
      validate={validate}
      format={(value) => {
        if (type === 'single_select' && value) return value[0];
        if (type === 'multi_select' && !value?.length) return [];
        return value;
      }}
      parse={(value) =>
        [null, undefined, '', []].includes(value)
          ? null
          : type === 'number'
            ? Number(value)
            : type === 'single_select'
              ? [value]
              : value
      }
      {...props}
    />
  );
};
