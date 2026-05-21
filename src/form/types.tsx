import React, { ReactNode } from 'react';
import { FieldInputProps, FieldMetaState } from 'react-final-form';

export type Validator = (value: any, allValues?: any, meta?: any) => any;
export type Normalizer = (
  value: any,
  previousValue?: any,
  allValues?: any,
  previousAllValues?: any,
) => any;
export type Formatter = (value: any, name?: string) => any;
export type Parser = (value: any, name?: string) => any;

export interface FormField {
  name?: string;
  input?: FieldInputProps<any, any>;
  meta?: FieldMetaState<any>;
  required?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  tooltip?: ReactNode;
  validate?: Validator | Validator[];
  isInvalid?: boolean;
  disabled?: boolean;
  hideLabel?: boolean;
  normalize?: Normalizer;
  format?: Formatter | null;
  parse?: Parser;

  noUpdateOnBlur?: boolean;
  onBlur?(e): void;
  containerClassName?: string;
  spaceless?: boolean;
  space?: number;
  'data-testid'?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
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
