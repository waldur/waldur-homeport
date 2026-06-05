import { FieldValidator } from 'final-form';
import React, { ReactNode } from 'react';
import { FieldProps, FieldRenderProps } from 'react-final-form';

type Formatter = NonNullable<FieldProps<any, any>['format']>;
type Parser = NonNullable<FieldProps<any, any>['parse']>;

export interface FormField extends Partial<FieldRenderProps<any, any>> {
  name?: string;
  required?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  tooltip?: ReactNode;
  validate?: FieldValidator<any>;
  isInvalid?: boolean;
  disabled?: boolean;
  hideLabel?: boolean;
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
