import { FC } from 'react';
import { FieldRenderProps } from 'react-final-form';

import { SecretInput } from 'waldur-ui';

import { BaseInputFieldProps } from './InputField';

// ── Base (Pure UI) ──────────────────────────────────────

export interface BaseSecretFieldProps extends Omit<
  BaseInputFieldProps,
  'type' | 'autoComplete' | 'plaintext' | 'containerClassName'
> {
  /** Classes for the `<input>`; `className` goes on the wrapper. */
  inputClassName?: string;
}

export const BaseSecretField: FC<BaseSecretFieldProps> = ({
  className,
  inputClassName,
  isInvalid,
  ...rest
}) => (
  <div className={className}>
    <SecretInput invalid={isInvalid} className={inputClassName} {...rest} />
  </div>
);

// ── Field Adapter ───────────────────────────────────────

export interface SecretFieldProps extends Omit<
  BaseSecretFieldProps,
  'value' | 'onChange' | 'onBlur' | 'onFocus' | 'name'
> {
  input: FieldRenderProps<any>['input'];
  meta?: FieldRenderProps<any>['meta'];
}

export const SecretField: FC<SecretFieldProps> = ({ input, meta, ...rest }) => (
  <BaseSecretField
    isInvalid={meta?.touched && !!meta?.error}
    {...rest}
    {...input}
  />
);
