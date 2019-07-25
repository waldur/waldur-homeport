import { ReactNode } from 'react';
import { WrappedFieldInputProps, Validator, Normalizer, Formatter, Parser } from 'redux-form';

export interface FormField {
  name?: string;
  input?: WrappedFieldInputProps;
  required?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  tooltip?: ReactNode;
  labelClass?: string;
  controlClass?: string;
  layout?: 'horizontal' | 'vertical';
  validate?: Validator | Validator[];
  disabled?: boolean;
  hideLabel?: boolean;
  normalize?: Normalizer;
  format?: Formatter | null;
  parse?: Parser;
  // See also: https://github.com/erikras/redux-form/issues/2768#issuecomment-292770517
  noUpdateOnBlur?: boolean;
}
