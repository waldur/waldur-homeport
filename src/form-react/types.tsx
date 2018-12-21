import { ReactNode } from 'react';
import { WrappedFieldInputProps, Validator, Normalizer } from 'redux-form';

export interface FormField {
  name?: string;
  input?: WrappedFieldInputProps;
  required?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  tooltip?: ReactNode;
  labelClass?: string;
  controlClass?: string;
  validate?: Validator | Validator[];
  disabled?: boolean;
  hideLabel?: boolean;
  normalize?: Normalizer;
  // See also: https://github.com/erikras/redux-form/issues/2768#issuecomment-292770517
  noUpdateOnBlur?: boolean;
}

export interface SelectDialogFieldChoice {
  url: string;
  uuid: string;
  name: string;
  disabled?: boolean;
  disabledReason?: string;
}

export interface SelectDialogFieldColumn {
  name: string;
  label: React.ReactNode;
  headerClass?: string;
}
