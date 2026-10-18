import { FC } from 'react';

import { FormField as UiFormField, NativeSelect } from 'waldur-ui';

import { BaseInputField } from '@/form/InputField';

interface FormFieldProps {
  input: any;
  meta: { error?: string; touched?: boolean };
  children?: React.ReactNode;
  [key: string]: any;
}

export const FormField: FC<FormFieldProps> = ({
  input,
  meta: { error, touched },
  'aria-label': ariaLabel,
  ...rest
}) => (
  <UiFormField as="td">
    <BaseInputField
      {...input}
      {...rest}
      isInvalid={touched && !!error}
      title={touched && error ? error : undefined}
      aria-label={ariaLabel}
    />
  </UiFormField>
);

/** A rule-editor table cell holding a native select; the error is its tooltip. */
export const FormSelectField: FC<FormFieldProps> = ({
  input,
  meta: { error, touched },
  children,
  'aria-label': ariaLabel,
  ...rest
}) => (
  <UiFormField as="td">
    <NativeSelect
      {...input}
      {...rest}
      invalid={touched && !!error}
      title={touched && error ? error : undefined}
      aria-label={ariaLabel}
    >
      {children}
    </NativeSelect>
  </UiFormField>
);
