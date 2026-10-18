import { FC } from 'react';
import { FieldRenderProps } from 'react-final-form';

import { BaseInputField, BaseInputFieldProps } from './InputField';

// ── Base (Pure UI) ──────────────────────────────────────

const BaseEmailField: FC<BaseInputFieldProps> = (props) => (
  <BaseInputField type="email" {...props} />
);

// ── Field Adapter ───────────────────────────────────────

export interface EmailFieldProps extends Omit<
  BaseInputFieldProps,
  'value' | 'onChange' | 'onBlur' | 'onFocus' | 'name'
> {
  input: FieldRenderProps<any>['input'];
  meta: FieldRenderProps<any>['meta'];
}

export const EmailField: FC<EmailFieldProps> = ({ input, meta, ...rest }) => (
  <BaseEmailField
    isInvalid={meta.touched && !!meta.error}
    {...rest}
    {...input}
  />
);
