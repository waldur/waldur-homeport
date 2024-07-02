import React, { ReactNode } from 'react';
import {
  WrappedFieldInputProps,
  Validator,
  Normalizer,
  Formatter,
  Parser,
  WrappedFieldMetaProps,
} from 'redux-form';

export interface FormField {
  name?: string;
  input?: WrappedFieldInputProps;
  meta?: WrappedFieldMetaProps;
  required?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  tooltip?: ReactNode;
  validate?: Validator | Validator[];
  disabled?: boolean;
  hideLabel?: boolean;
  normalize?: Normalizer;
  format?: Formatter | null;
  parse?: Parser;
  // See also: https://github.com/erikras/redux-form/issues/2768#issuecomment-292770517
  noUpdateOnBlur?: boolean;
  floating?: boolean;
}

export interface CustomComponentInputProps<T> {
  name: string;
  value: T;
  onChange(value?: T): void;
}

export interface FilterOptions {
  name: string;
  choices: Array<{ value: string; label: string }>;
  defaultValue: string;
}

export type PeriodOption = {
  year: number;
  month: number;
  current: boolean;
};
export interface SelectDialogFieldChoice extends Record<string, any> {
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
  filter?(input: string): string;
}
