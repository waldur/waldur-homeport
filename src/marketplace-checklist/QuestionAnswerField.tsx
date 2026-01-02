import { ComponentType } from 'react';
import { Field } from 'react-final-form';
import { QuestionAdmin, QuestionTypeEnum } from 'waldur-js-client';

import {
  FileUploadField,
  NumberField,
  SelectField,
  StringField,
  TextField,
} from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { CountrySelectField } from '@waldur/form/CountrySelectField';
import { DateField } from '@waldur/form/DateField';
import { DateTimeField } from '@waldur/form/DateTimeField';
import { EmailField } from '@waldur/form/EmailField';
import { PhoneNumberField } from '@waldur/form/PhoneNumberField';
import { YearField } from '@waldur/form/YearField';
import { translate } from '@waldur/i18n';
import {
  isQuestionSelectType,
  useQuestionNumberValidator,
} from '@waldur/marketplace-checklist/utils';

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
};

type OwnProps = {
  question: QuestionAdmin;
  name: string;
} & Record<string, any>;

export const QuestionAnswerField = ({ question, name, ...props }: OwnProps) => {
  const type = question.question_type;
  const isSelectType = isQuestionSelectType(type);
  const numberValidator = useQuestionNumberValidator(question);

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
      {...(type === 'file'
        ? {
            showFileName: true,
            buttonLabel: translate('Browse'),
          }
        : {})}
      validate={type === 'number' ? numberValidator : undefined}
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
